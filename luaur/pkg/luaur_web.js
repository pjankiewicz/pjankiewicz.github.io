/* @ts-self-types="./luaur_web.d.ts" */
import * as import1 from "env"
import * as import2 from "env"


/**
 * Structured result of a [`run`] call: the program's captured `print` output
 * and, *separately*, any error text (an empty string when the run succeeded).
 *
 * Keeping the two apart — rather than concatenating them into one string the
 * caller then has to guess apart — is what lets the playground classify a run
 * correctly. With a single combined string the only signal available to
 * JavaScript was a content heuristic, which both *false-positived* (legitimate
 * output containing the word "error" — e.g. iterating `_G`, which has a global
 * literally named `error` — was painted as a failure) and *false-negatived* (a
 * compile error whose text lacked the magic words was reported as success).
 * `error` non-empty ⇔ the run failed; no scanning of `output` required.
 */
export class RunResult {
    static __wrap(ptr) {
        const obj = Object.create(RunResult.prototype);
        obj.__wbg_ptr = ptr;
        RunResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RunResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_runresult_free(ptr, 0);
    }
    /**
     * Error text, or the empty string when the run succeeded. In the browser
     * build this is a compile/load error message: a genuine *runtime* error
     * traps the WebAssembly instance (`panic = "abort"` on
     * `wasm32-unknown-unknown`) and is surfaced by the caller's trap handler,
     * so it never reaches here.
     * @returns {string}
     */
    get error() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.runresult_error(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The script's captured `print` output (tab-separated arguments, one line
     * per `print`, each terminated by a newline).
     * @returns {string}
     */
    get output() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.runresult_output(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) RunResult.prototype[Symbol.dispose] = RunResult.prototype.free;

/**
 * Type-check `source` with the analyzer (old solver) and return the
 * newline-joined `line: message` diagnostics, or `"No errors."` when clean.
 *
 * This wraps the crate's `extern "C"` `check_script`, converting the returned
 * C string pointer back into an owned `String`.
 * @param {string} source
 * @returns {string}
 */
export function check(source) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.check(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * Compile and execute `source` on a fresh sandboxed Luau VM, returning the
 * program's captured `print` output and any error text as separate fields of a
 * [`RunResult`].
 *
 * This is the browser counterpart of the crate's `extern "C"` `execute_script`
 * — it shares `setup_state` and `run_code`, but installs a capturing `print`.
 * @param {string} source
 * @returns {RunResult}
 */
export function run(source) {
    const ptr0 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.run(ptr0, len0);
    return RunResult.__wrap(ret);
}

/**
 * Module start hook. A Lua runtime error reaches this panic hook as a
 * `lua_exception` payload (`luaD_throw` -> `panic_any`). We recover its message
 * (`what()` reads the error object off the still-intact stack — `panic=abort`
 * does not unwind) and hand it to JS *before* the abort traps the instance, so
 * runtime errors surface with their text instead of an opaque `unreachable`
 * trap. Any other panic keeps the `console.error` diagnostic.
 *
 * ## Hook ordering — why this is more than a single `set_hook`
 *
 * The VM installs its OWN process-wide hook ([`install_lua_exception_panic_hook`],
 * fired lazily on the first `luaD_rawrunprotected` during state setup) that
 * *silently swallows* every `lua_exception` payload: those panics are its
 * `longjmp` emulation, not crashes, and the CLI must not print "thread panicked"
 * for a normal `error()`. That same swallowing, however, also hides the error
 * *message* — the VM hook `take_hook()`s whatever we install and then `return`s
 * early for `lua_exception`, so a naive hook here would never be reached.
 *
 * So we deliberately build the chain with OUR hook outermost (it runs first):
 *
 * ```text
 *   ours (lua_exception -> JS bridge)  ->  VM hook  ->  console_error_panic_hook
 * ```
 *
 * Force `console_error_panic_hook` as the base, force the VM hook to install on
 * top of it *now* (so its captured `previous` is the console hook, not ours),
 * then wrap that with our hook. A `lua_exception` is intercepted here and its
 * message forwarded to JS; any real Rust bug falls through to the VM hook, which
 * delegates to `console_error_panic_hook` unchanged.
 */
export function wasm_start() {
    wasm.wasm_start();
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___luaurOnRuntimeError_dbb1c9cdf8631b66: function(arg0, arg1) {
            globalThis.__luaurOnRuntimeError(getStringFromWasm0(arg0, arg1));
        },
        __wbg___wbindgen_throw_1506f2235d1bdba0: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_error_a6fa202b58aa1cd3: function(arg0, arg1) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                console.error(getStringFromWasm0(arg0, arg1));
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        },
        __wbg_new_227d7c05414eb861: function() {
            const ret = new Error();
            return ret;
        },
        __wbg_stack_3b0d974bbf31e44f: function(arg0, arg1) {
            const ret = arg1.stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./luaur_web_bg.js": import0,
        "env": import1,
        "env": import2,
    };
}

const RunResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_runresult_free(ptr, 1));

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('luaur_web_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
