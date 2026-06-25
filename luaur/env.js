// Host shims for the two C library functions that cannot be provided in Rust on
// `wasm32-unknown-unknown` because they are C-variadic: `snprintf` and
// `strftime`. Every other libc symbol the translation needs is defined in Rust
// (luaur_common::wasm_libc); these two require reading a clang `va_list`, which
// only the host can do portably.
//
// `string.format` issues one conversion at a time (str_format.rs scans a single
// `%…` spec, then calls snprintf with exactly one argument), so the shim only
// has to render a single value per call. `strftime` is reached only by
// `os.date`, which the bundled examples do not use; it is implemented enough to
// be correct for common specifiers.
//
// The wasm memory is injected by app.js right after the module initializes
// (before any script can run), via `setMemory`.

let MEM = null;
export function setMemory(memory) {
  MEM = memory;
}

const td = new TextDecoder("utf-8");
const te = new TextEncoder();

function dv() {
  return new DataView(MEM.buffer);
}

// Read a NUL-terminated UTF-8 C string at byte offset `ptr`.
function readCStr(ptr) {
  const bytes = new Uint8Array(MEM.buffer);
  let end = ptr;
  while (bytes[end] !== 0) end++;
  return td.decode(bytes.subarray(ptr, end));
}

// Write `str` plus a terminating NUL into `[dest, dest+max)`, C-snprintf style.
// Returns the number of characters that *would* have been written (excluding
// NUL), matching the C return value.
function writeCStr(dest, max, str) {
  const encoded = te.encode(str);
  const bytes = new Uint8Array(MEM.buffer);
  if (max > 0) {
    const n = Math.min(encoded.length, max - 1);
    bytes.set(encoded.subarray(0, n), dest);
    bytes[dest + n] = 0;
  }
  return encoded.length;
}

// ── format-spec parsing ──────────────────────────────────────────────
// Parse a single C conversion specification: %[flags][width][.precision][length]conv
function parseSpec(fmt) {
  // fmt is exactly one spec like "%-08.3f" / "%lld" / "%5s".
  const m = /^%([-+ 0#]*)(\d*)(?:\.(\d+))?(hh|h|ll|l|L|j|z|t)?([diouxXeEfFgGcsp%])/.exec(
    fmt
  );
  if (!m) return null;
  return {
    flags: m[1] || "",
    width: m[2] ? parseInt(m[2], 10) : 0,
    precision: m[3] !== undefined ? parseInt(m[3], 10) : null,
    conv: m[5],
  };
}

function applyPadding(s, spec) {
  if (s.length >= spec.width) return s;
  const pad = spec.width - s.length;
  if (spec.flags.includes("-")) {
    return s + " ".repeat(pad);
  }
  if (spec.flags.includes("0") && !"sc".includes(spec.conv)) {
    // zero-pad after any sign.
    if (s[0] === "-" || s[0] === "+" || s[0] === " ") {
      return s[0] + "0".repeat(pad) + s.slice(1);
    }
    return "0".repeat(pad) + s;
  }
  return " ".repeat(pad) + s;
}

function signPrefix(flags, negative) {
  if (negative) return "-";
  if (flags.includes("+")) return "+";
  if (flags.includes(" ")) return " ";
  return "";
}

// ── snprintf(s, n, format, va_ptr) ───────────────────────────────────
// clang lowers the C-variadic call to pass a pointer to a packed argument
// area. Each argument occupies an 8-byte-aligned slot (ints in the low 4/8
// bytes, doubles as f64). str_format always passes exactly one argument.
export function snprintf(s, n, format, vaPtr) {
  const fmt = readCStr(format);
  const spec = parseSpec(fmt);
  if (!spec) {
    return writeCStr(s, n, fmt);
  }
  const view = dv();
  let out;

  switch (spec.conv) {
    case "%":
      out = "%";
      break;
    case "c": {
      const code = view.getInt32(vaPtr, true) & 0xff;
      out = String.fromCharCode(code);
      break;
    }
    case "d":
    case "i": {
      // promoted to 64-bit (the format carries an `ll` length modifier).
      const v = view.getBigInt64(vaPtr, true);
      const neg = v < 0n;
      let digits = (neg ? -v : v).toString(10);
      if (spec.precision !== null) digits = digits.padStart(spec.precision, "0");
      out = applyPadding(signPrefix(spec.flags, neg) + digits, spec);
      break;
    }
    case "u":
    case "o":
    case "x":
    case "X": {
      const v = view.getBigUint64(vaPtr, true);
      const radix = spec.conv === "o" ? 8 : spec.conv === "u" ? 10 : 16;
      let digits = v.toString(radix);
      if (spec.conv === "X") digits = digits.toUpperCase();
      if (spec.precision !== null) digits = digits.padStart(spec.precision, "0");
      if (spec.flags.includes("#") && v !== 0n) {
        if (spec.conv === "x") digits = "0x" + digits;
        else if (spec.conv === "X") digits = "0X" + digits;
        else if (spec.conv === "o") digits = "0" + digits;
      }
      out = applyPadding(digits, spec);
      break;
    }
    case "f":
    case "F": {
      const v = view.getFloat64(vaPtr, true);
      const prec = spec.precision !== null ? spec.precision : 6;
      const neg = v < 0 || Object.is(v, -0);
      let digits = Math.abs(v).toFixed(prec);
      out = applyPadding(signPrefix(spec.flags, neg) + digits, spec);
      break;
    }
    case "e":
    case "E": {
      const v = view.getFloat64(vaPtr, true);
      const prec = spec.precision !== null ? spec.precision : 6;
      const neg = v < 0 || Object.is(v, -0);
      let digits = Math.abs(v).toExponential(prec);
      // JS uses e+1; C uses e+01 (≥2 exponent digits).
      digits = digits.replace(/e([+-])(\d)$/, "e$10$2");
      if (spec.conv === "E") digits = digits.toUpperCase();
      out = applyPadding(signPrefix(spec.flags, neg) + digits, spec);
      break;
    }
    case "g":
    case "G": {
      const v = view.getFloat64(vaPtr, true);
      const prec = spec.precision !== null ? (spec.precision === 0 ? 1 : spec.precision) : 6;
      const neg = v < 0 || Object.is(v, -0);
      const a = Math.abs(v);
      let digits = a.toPrecision(prec);
      // %g strips trailing zeros unless '#' flag is given.
      if (!spec.flags.includes("#")) {
        if (digits.indexOf("e") >= 0) {
          let [mant, exp] = digits.split("e");
          if (mant.indexOf(".") >= 0) mant = mant.replace(/\.?0+$/, "");
          digits = mant + "e" + exp;
        } else if (digits.indexOf(".") >= 0) {
          digits = digits.replace(/\.?0+$/, "");
        }
      }
      digits = digits.replace(/e([+-])(\d)$/, "e$10$2");
      if (spec.conv === "G") digits = digits.toUpperCase();
      out = applyPadding(signPrefix(spec.flags, neg) + digits, spec);
      break;
    }
    case "s": {
      const strPtr = view.getInt32(vaPtr, true);
      let str = strPtr === 0 ? "(null)" : readCStr(strPtr);
      if (spec.precision !== null) str = str.slice(0, spec.precision);
      out = applyPadding(str, spec);
      break;
    }
    case "p": {
      const ptr = view.getInt32(vaPtr, true) >>> 0;
      out = applyPadding("0x" + ptr.toString(16), spec);
      break;
    }
    default:
      out = fmt;
  }

  return writeCStr(s, n, out);
}

// strtoul — only referenced by unoptimized (dev) wasm builds; release inlines
// it away. Provided so a dev diagnostic build can still instantiate. Parses a
// base-10/16 unsigned long from a wasm-memory C string.
export function strtoul(nptr, endptr, base) {
  const bytes = new Uint8Array(MEM.buffer);
  let p = nptr;
  while (bytes[p] === 32 || (bytes[p] >= 9 && bytes[p] <= 13)) p++;
  let b = base;
  if ((b === 0 || b === 16) && bytes[p] === 48 && (bytes[p + 1] === 120 || bytes[p + 1] === 88)) {
    p += 2; b = 16;
  } else if (b === 0) b = 10;
  let acc = 0;
  const start = p;
  for (;;) {
    const c = bytes[p];
    let d;
    if (c >= 48 && c <= 57) d = c - 48;
    else if (c >= 97 && c <= 122) d = c - 97 + 10;
    else if (c >= 65 && c <= 90) d = c - 65 + 10;
    else break;
    if (d >= b) break;
    acc = acc * b + d;
    p++;
  }
  if (endptr !== 0) new DataView(MEM.buffer).setInt32(endptr, p === start ? nptr : p, true);
  return acc >>> 0;
}

// ── strftime(s, max, format, tm_ptr) ─────────────────────────────────
// Renders a broken-down time. tm layout matches luaur's `struct tm`
// (9 × i32: sec, min, hour, mday, mon, year, wday, yday, isdst).
const WDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WDAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MON_FULL = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

export function strftime(s, max, format, tmPtr) {
  const view = dv();
  const tm = {
    sec: view.getInt32(tmPtr + 0, true),
    min: view.getInt32(tmPtr + 4, true),
    hour: view.getInt32(tmPtr + 8, true),
    mday: view.getInt32(tmPtr + 12, true),
    mon: view.getInt32(tmPtr + 16, true),
    year: view.getInt32(tmPtr + 20, true) + 1900,
    wday: view.getInt32(tmPtr + 24, true),
    yday: view.getInt32(tmPtr + 28, true),
  };
  const p2 = (x) => String(x).padStart(2, "0");
  const fmt = readCStr(format);
  let out = "";
  for (let i = 0; i < fmt.length; i++) {
    if (fmt[i] !== "%") { out += fmt[i]; continue; }
    i++;
    switch (fmt[i]) {
      case "a": out += WDAY[tm.wday] ?? ""; break;
      case "A": out += WDAY_FULL[tm.wday] ?? ""; break;
      case "b": case "h": out += MON[tm.mon] ?? ""; break;
      case "B": out += MON_FULL[tm.mon] ?? ""; break;
      case "d": out += p2(tm.mday); break;
      case "H": out += p2(tm.hour); break;
      case "I": out += p2(((tm.hour + 11) % 12) + 1); break;
      case "j": out += String(tm.yday + 1).padStart(3, "0"); break;
      case "m": out += p2(tm.mon + 1); break;
      case "M": out += p2(tm.min); break;
      case "p": out += tm.hour < 12 ? "AM" : "PM"; break;
      case "S": out += p2(tm.sec); break;
      case "w": out += String(tm.wday); break;
      case "y": out += p2(tm.year % 100); break;
      case "Y": out += String(tm.year); break;
      case "%": out += "%"; break;
      case "c":
        out += `${WDAY[tm.wday]} ${MON[tm.mon]} ${String(tm.mday).padStart(2, " ")} ` +
               `${p2(tm.hour)}:${p2(tm.min)}:${p2(tm.sec)} ${tm.year}`;
        break;
      case "x": out += `${p2(tm.mon + 1)}/${p2(tm.mday)}/${p2(tm.year % 100)}`; break;
      case "X": out += `${p2(tm.hour)}:${p2(tm.min)}:${p2(tm.sec)}`; break;
      default: out += "%" + (fmt[i] ?? "");
    }
  }
  return writeCStr(s, max, out);
}
