/* tslint:disable */
/* eslint-disable */

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
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Error text, or the empty string when the run succeeded. In the browser
     * build this is a compile/load error message: a genuine *runtime* error
     * traps the WebAssembly instance (`panic = "abort"` on
     * `wasm32-unknown-unknown`) and is surfaced by the caller's trap handler,
     * so it never reaches here.
     */
    readonly error: string;
    /**
     * The script's captured `print` output (tab-separated arguments, one line
     * per `print`, each terminated by a newline).
     */
    readonly output: string;
}

/**
 * Type-check `source` with the analyzer (old solver) and return the
 * newline-joined `line: message` diagnostics, or `"No errors."` when clean.
 *
 * This wraps the crate's `extern "C"` `check_script`, converting the returned
 * C string pointer back into an owned `String`.
 */
export function check(source: string): string;

/**
 * Compile and execute `source` on a fresh sandboxed Luau VM, returning the
 * program's captured `print` output and any error text as separate fields of a
 * [`RunResult`].
 *
 * This is the browser counterpart of the crate's `extern "C"` `execute_script`
 * — it shares `setup_state` and `run_code`, but installs a capturing `print`.
 */
export function run(source: string): RunResult;

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
export function wasm_start(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly luaur_lua_gettop: (a: number) => number;
    readonly luaur_lua_settop: (a: number, b: number) => void;
    readonly check_script: (a: number, b: number) => number;
    readonly free: (a: number) => void;
    readonly luaur_lua_xmove: (a: number, b: number, c: number) => void;
    readonly __wbg_runresult_free: (a: number, b: number) => void;
    readonly check: (a: number, b: number) => [number, number];
    readonly execute_script: (a: number) => number;
    readonly run: (a: number, b: number) => number;
    readonly runresult_error: (a: number) => [number, number];
    readonly runresult_output: (a: number) => [number, number];
    readonly wasm_start: () => void;
    readonly sysconf: (a: number) => number;
    readonly mprotect: (a: number, b: number, c: number) => number;
    readonly munmap: (a: number, b: number) => number;
    readonly luaur_lua_setthreaddata: (a: number, b: number) => void;
    readonly luaur_lua_type: (a: number, b: number) => number;
    readonly luaur_lua_pushnil: (a: number) => void;
    readonly luaur_lua_pushboolean: (a: number, b: number) => void;
    readonly mmap: (a: number, b: number, c: number, d: number, e: number, f: bigint) => number;
    readonly luaur_lua_l_checkboolean: (a: number, b: number) => number;
    readonly luaur_lua_isstring: (a: number, b: number) => number;
    readonly luaur_lua_l_newmetatable: (a: number, b: number) => number;
    readonly luaur_lua_pushnumber: (a: number, b: number) => void;
    readonly clock: () => number;
    readonly luaur_os_time: (a: number) => number;
    readonly luaur_os_difftime: (a: number) => number;
    readonly luaur_scanformat: (a: number, b: number, c: number, d: number) => number;
    readonly strchr: (a: number, b: number) => number;
    readonly luaur_lua_l_checkinteger_64: (a: number, b: number) => bigint;
    readonly luaur_auxresumecont: (a: number, b: number) => number;
    readonly luaur_lua_g_pusherror: (a: number, b: number) => void;
    readonly luaur_lua_d_callny: (a: number, b: number, c: number) => void;
    readonly localtime_r: (a: number, b: number) => number;
    readonly luaur_lua_l_optlstring: (a: number, b: number, c: number, d: number) => number;
    readonly luaur_lua_b_inext: (a: number) => number;
    readonly luaur_lua_b_ipairs: (a: number) => number;
    readonly luaur_lua_b_next: (a: number) => number;
    readonly luaur_lua_b_pairs: (a: number) => number;
    readonly luaur_lua_v_tryfunc_tm: (a: number, b: number) => void;
    readonly luaur_luaF_recordhit: (a: number, b: number, c: number, d: number) => number;
    readonly luaur_lua_v_prepare_forn: (a: number, b: number, c: number, d: number) => void;
    readonly strtod: (a: number, b: number) => number;
    readonly strtoul: (a: number, b: number, c: number) => number;
    readonly strtoull: (a: number, b: number, c: number) => bigint;
    readonly luaur_class_classof: (a: number) => number;
    readonly luaur_class_isinstance: (a: number) => number;
    readonly luaur_tunpack: (a: number) => number;
    readonly malloc: (a: number) => number;
    readonly luaur_luaL_findtable: (a: number, b: number, c: number, d: number) => number;
    readonly luaur_str_split: (a: number) => number;
    readonly luaur_str_sub: (a: number) => number;
    readonly luaur_str_match: (a: number) => number;
    readonly luaur_str_len: (a: number) => number;
    readonly luaur_gmatch: (a: number) => number;
    readonly luaur_str_find: (a: number) => number;
    readonly luaur_str_char: (a: number) => number;
    readonly luaur_str_byte: (a: number) => number;
    readonly luaur_lua_l_callmeta: (a: number, b: number, c: number) => number;
    readonly luaur_pusherror: (a: number, b: number) => void;
    readonly luaur_lua_l_argerror_l: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_luaL_checkoption: (a: number, b: number, c: number, d: number) => number;
    readonly luaur_lua_l_getmetafield: (a: number, b: number, c: number) => number;
    readonly realloc: (a: number, b: number) => number;
    readonly time: (a: number) => bigint;
    readonly gmtime_r: (a: number, b: number) => number;
    readonly luaur_auxwrapy: (a: number) => number;
    readonly luaur_byteoffset: (a: number) => number;
    readonly luaur_cocreate: (a: number) => number;
    readonly luaur_codepoint: (a: number) => number;
    readonly luaur_coresumefinish: (a: number, b: number) => number;
    readonly luaur_cowrap: (a: number) => number;
    readonly luaur_coyield: (a: number) => number;
    readonly luaur_coyieldable: (a: number) => number;
    readonly luaur_foreach: (a: number) => number;
    readonly luaur_foreachi: (a: number) => number;
    readonly luaur_getn: (a: number) => number;
    readonly luaur_int64_add: (a: number) => number;
    readonly luaur_int64_arshift: (a: number) => number;
    readonly luaur_int64_band: (a: number) => number;
    readonly luaur_int64_bor: (a: number) => number;
    readonly luaur_int64_btest: (a: number) => number;
    readonly luaur_int64_clamp: (a: number) => number;
    readonly luaur_int64_create: (a: number) => number;
    readonly luaur_int64_div: (a: number) => number;
    readonly luaur_int64_extract: (a: number) => number;
    readonly luaur_int64_fromstring: (a: number) => number;
    readonly luaur_int64_ge: (a: number) => number;
    readonly luaur_int64_gt: (a: number) => number;
    readonly luaur_int64_idiv: (a: number) => number;
    readonly luaur_int64_le: (a: number) => number;
    readonly luaur_int64_lrotate: (a: number) => number;
    readonly luaur_int64_lshift: (a: number) => number;
    readonly luaur_int64_lt: (a: number) => number;
    readonly luaur_int64_max: (a: number) => number;
    readonly luaur_int64_min: (a: number) => number;
    readonly luaur_int64_mod: (a: number) => number;
    readonly luaur_int64_mul: (a: number) => number;
    readonly luaur_int64_neg: (a: number) => number;
    readonly luaur_int64_rem: (a: number) => number;
    readonly luaur_int64_rrotate: (a: number) => number;
    readonly luaur_int64_rshift: (a: number) => number;
    readonly luaur_int64_sub: (a: number) => number;
    readonly luaur_int64_tonumber: (a: number) => number;
    readonly luaur_int64_udiv: (a: number) => number;
    readonly luaur_int64_uge: (a: number) => number;
    readonly luaur_int64_ule: (a: number) => number;
    readonly luaur_int64_ult: (a: number) => number;
    readonly luaur_int64_urem: (a: number) => number;
    readonly luaur_int_64_bnot: (a: number) => number;
    readonly luaur_int_64_bxor: (a: number) => number;
    readonly luaur_int_64_ugt: (a: number) => number;
    readonly luaur_iter_aux: (a: number) => number;
    readonly luaur_iter_codes: (a: number) => number;
    readonly luaur_luaA_pushclass: (a: number, b: number) => void;
    readonly luaur_luaA_pushvalue: (a: number, b: number) => void;
    readonly luaur_luaB_xpcallerr: (a: number, b: number) => void;
    readonly luaur_luaC_allocationrate: (a: number) => bigint;
    readonly luaur_luaC_barrierback: (a: number, b: number, c: number) => void;
    readonly luaur_luaC_step: (a: number, b: number) => number;
    readonly luaur_luaD_checkCstack: (a: number) => void;
    readonly luaur_luaD_growCI: (a: number) => number;
    readonly luaur_luaD_seterrorobj: (a: number, b: number, c: number) => void;
    readonly luaur_luaF_close: (a: number, b: number) => void;
    readonly luaur_luaG_getline: (a: number, b: number) => number;
    readonly luaur_luaG_isnative: (a: number, b: number) => number;
    readonly luaur_luaG_onbreak: (a: number) => number;
    readonly luaur_luaH_clone: (a: number, b: number) => number;
    readonly luaur_luaH_getn: (a: number) => number;
    readonly luaur_luaH_new: (a: number, b: number, c: number) => number;
    readonly luaur_luaH_setnum: (a: number, b: number, c: number) => number;
    readonly luaur_luaL_checkinteger64: (a: number, b: number) => bigint;
    readonly luaur_luaM_getnextpage: (a: number) => number;
    readonly luaur_luaT_objtypenamestr: (a: number, b: number) => number;
    readonly luaur_luaV_concat: (a: number, b: number, c: number) => void;
    readonly luaur_luaV_doarithimpl_TM_ADD: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_luaV_doarithimpl_TM_DIV: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_luaV_doarithimpl_TM_IDIV: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_luaV_doarithimpl_TM_MOD: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_luaV_doarithimpl_TM_MUL: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_luaV_doarithimpl_TM_POW: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_luaV_doarithimpl_TM_SUB: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_luaV_doarithimpl_TM_UNM: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_luaV_dolen: (a: number, b: number, c: number) => void;
    readonly luaur_luaV_equalval: (a: number, b: number, c: number) => number;
    readonly luaur_luaV_gettable: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_luaV_lessequal: (a: number, b: number, c: number) => number;
    readonly luaur_luaV_lessthan: (a: number, b: number, c: number) => number;
    readonly luaur_luaV_settable: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_lua_b_assert: (a: number) => number;
    readonly luaur_lua_b_gcinfo: (a: number) => number;
    readonly luaur_lua_b_getmetatable: (a: number) => number;
    readonly luaur_lua_b_print: (a: number) => number;
    readonly luaur_lua_b_rawequal: (a: number) => number;
    readonly luaur_lua_b_rawget: (a: number) => number;
    readonly luaur_lua_b_rawlen: (a: number) => number;
    readonly luaur_lua_b_rawset: (a: number) => number;
    readonly luaur_lua_b_tostring: (a: number) => number;
    readonly luaur_lua_b_type: (a: number) => number;
    readonly luaur_lua_b_typeof: (a: number) => number;
    readonly luaur_lua_d_performcally: (a: number, b: number, c: number) => number;
    readonly luaur_lua_encodepointer: (a: number, b: number) => number;
    readonly luaur_lua_equal: (a: number, b: number, c: number) => number;
    readonly luaur_lua_g_hasnative: (a: number, b: number) => number;
    readonly luaur_lua_getargument: (a: number, b: number, c: number) => number;
    readonly luaur_lua_getlocal: (a: number, b: number, c: number) => number;
    readonly luaur_lua_isthreadreset: (a: number) => number;
    readonly luaur_lua_isyieldable: (a: number) => number;
    readonly luaur_lua_l_buffinit: (a: number, b: number) => void;
    readonly luaur_lua_l_checkudata: (a: number, b: number, c: number, d: number) => number;
    readonly luaur_lua_l_optinteger_64: (a: number, b: number, c: bigint) => bigint;
    readonly luaur_lua_lessthan: (a: number, b: number, c: number) => number;
    readonly luaur_lua_pushinteger_64: (a: number, b: bigint) => void;
    readonly luaur_lua_pushvector_lua_state_f32_f32_f32: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_lua_pushvector_lua_state_f32_f32_f32_f32: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly luaur_lua_rawequal: (a: number, b: number, c: number) => number;
    readonly luaur_lua_resumeerror: (a: number, b: number) => number;
    readonly luaur_lua_setlightuserdataname: (a: number, b: number, c: number) => void;
    readonly luaur_lua_setlocal: (a: number, b: number, c: number) => number;
    readonly luaur_lua_setuserdatametatable: (a: number, b: number) => void;
    readonly luaur_lua_singlestep: (a: number, b: number) => void;
    readonly luaur_lua_stackdepth: (a: number) => number;
    readonly luaur_lua_status: (a: number) => number;
    readonly luaur_lua_userdatadirectfield_setboolean: (a: number, b: number) => void;
    readonly luaur_lua_userdatadirectfield_setinteger64: (a: number, b: bigint) => void;
    readonly luaur_lua_userdatadirectfield_setnil: (a: number) => void;
    readonly luaur_lua_userdatadirectfield_setnumber: (a: number, b: number) => void;
    readonly luaur_lua_userdatadirectfield_setvector_void_f32_f32_f32: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_lua_userdatadirectfield_setvector_void_f32_f32_f32_f32: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly luaur_luai_num2str: (a: number, b: number) => number;
    readonly luaur_math_abs: (a: number) => number;
    readonly luaur_math_acos: (a: number) => number;
    readonly luaur_math_atan: (a: number) => number;
    readonly luaur_math_atan2: (a: number) => number;
    readonly luaur_math_clamp: (a: number) => number;
    readonly luaur_math_cos: (a: number) => number;
    readonly luaur_math_cosh: (a: number) => number;
    readonly luaur_math_deg: (a: number) => number;
    readonly luaur_math_exp: (a: number) => number;
    readonly luaur_math_floor: (a: number) => number;
    readonly luaur_math_fmod: (a: number) => number;
    readonly luaur_math_frexp: (a: number) => number;
    readonly luaur_math_isfinite: (a: number) => number;
    readonly luaur_math_isinf: (a: number) => number;
    readonly luaur_math_isnan: (a: number) => number;
    readonly luaur_math_ldexp: (a: number) => number;
    readonly luaur_math_lerp: (a: number) => number;
    readonly luaur_math_map: (a: number) => number;
    readonly luaur_math_max: (a: number) => number;
    readonly luaur_math_min: (a: number) => number;
    readonly luaur_math_modf: (a: number) => number;
    readonly luaur_math_noise: (a: number) => number;
    readonly luaur_math_pow: (a: number) => number;
    readonly luaur_math_rad: (a: number) => number;
    readonly luaur_math_round: (a: number) => number;
    readonly luaur_math_sign: (a: number) => number;
    readonly luaur_math_sin: (a: number) => number;
    readonly luaur_math_sinh: (a: number) => number;
    readonly luaur_math_sqrt: (a: number) => number;
    readonly luaur_math_tan: (a: number) => number;
    readonly luaur_math_tanh: (a: number) => number;
    readonly luaur_str_find_aux: (a: number, b: number) => number;
    readonly luaur_tclear: (a: number) => number;
    readonly luaur_tclone: (a: number) => number;
    readonly luaur_tconcat: (a: number) => number;
    readonly luaur_tcreate: (a: number) => number;
    readonly luaur_tfind: (a: number) => number;
    readonly luaur_tfreeze: (a: number) => number;
    readonly luaur_tinsert: (a: number) => number;
    readonly luaur_tisfrozen: (a: number) => number;
    readonly luaur_tpack: (a: number) => number;
    readonly luaur_tremove: (a: number) => number;
    readonly luaur_tsort: (a: number) => number;
    readonly luaur_utfchar: (a: number) => number;
    readonly luaur_utflen: (a: number) => number;
    readonly luaur_vector_angle: (a: number) => number;
    readonly luaur_vector_clamp: (a: number) => number;
    readonly luaur_luaC_barrierf: (a: number, b: number, c: number) => void;
    readonly luaur_luaF_findupval: (a: number, b: number) => number;
    readonly luaur_luaT_gettm: (a: number, b: number, c: number) => number;
    readonly luaur_luaF_newLclosure: (a: number, b: number, c: number, d: number) => number;
    readonly luaur_lua_d_rawrunprotected_mut: (a: number, b: number, c: number) => number;
    readonly luaur_luaH_resizearray: (a: number, b: number, c: number) => void;
    readonly luaur_lua_userdatadirectfield_setinteger_64: (a: number, b: bigint) => void;
    readonly luaur_luaC_barriertable: (a: number, b: number, c: number) => void;
    readonly luaur_luaU_newudata: (a: number, b: number, c: number) => number;
    readonly luaur_luau_set_compile_constant_number: (a: number, b: number) => void;
    readonly luaur_ast_attr_as_attr: (a: number) => number;
    readonly luaur_ast_expr_call_visit: (a: number, b: number) => void;
    readonly luaur_ast_expr_function_ast_expr_function: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number) => void;
    readonly luaur_ast_expr_if_else_ast_expr_if_else: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly luaur_ast_expr_if_else_visit: (a: number, b: number) => void;
    readonly luaur_ast_expr_interp_string_ast_expr_interp_string: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_ast_expr_local_ast_expr_local: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_ast_expr_table_ast_expr_table: (a: number, b: number, c: number) => void;
    readonly luaur_ast_expr_type_assertion_ast_expr_type_assertion: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_ast_generic_type_pack_ast_generic_type_pack: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_ast_generic_type_pack_visit: (a: number, b: number) => void;
    readonly luaur_ast_generic_type_visit: (a: number, b: number) => void;
    readonly luaur_ast_stat_class_ast_stat_class: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly luaur_ast_stat_for_in_visit: (a: number, b: number) => void;
    readonly luaur_ast_stat_for_visit: (a: number, b: number) => void;
    readonly luaur_ast_stat_local_visit: (a: number, b: number) => void;
    readonly luaur_ast_stat_type_alias_visit: (a: number, b: number) => void;
    readonly luaur_ast_type_error_ast_type_error: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly luaur_ast_type_pack_variadic_visit: (a: number, b: number) => void;
    readonly luaur_cst_expr_index_expr_cst_expr_index_expr: (a: number, b: number, c: number) => void;
    readonly luaur_cst_expr_interp_string_cst_expr_interp_string: (a: number, b: number, c: number) => void;
    readonly luaur_cst_expr_type_assertion_cst_expr_type_assertion: (a: number, b: number) => void;
    readonly luaur_cst_generic_type_cst_generic_type: (a: number, b: number) => void;
    readonly luaur_cst_generic_type_pack_cst_generic_type_pack: (a: number, b: number, c: number) => void;
    readonly luaur_cst_stat_assign_cst_stat_assign: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_cst_stat_for_cst_stat_for: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly luaur_cst_type_pack_generic_cst_type_pack_generic: (a: number, b: number) => void;
    readonly luaur_cst_type_singleton_string_cst_type_singleton_string: (a: number, b: number, c: number, d: number) => void;
    readonly luaur_printer_advance: (a: number, b: number) => void;
    readonly luaur_printer_maybe_advance_and_write: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly luaur_printer_visualize_block_ast_stat_block: (a: number, b: number) => void;
    readonly luaur_printer_write_end: (a: number, b: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
