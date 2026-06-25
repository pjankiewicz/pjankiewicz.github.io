/* tslint:disable */
/* eslint-disable */

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
 * program's captured `print` output followed by any runtime error text.
 *
 * This is the browser counterpart of the crate's `extern "C"` `execute_script`
 * — it shares `setup_state` and `run_code`, but installs a capturing `print`
 * and returns the captured output as an owned `String`.
 */
export function run(source: string): string;

/**
 * Module start hook: route Rust panics to `console.error` with a readable
 * message + location instead of an opaque `unreachable` wasm trap. Runs once
 * when the module is instantiated.
 */
export function wasm_start(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly execute_script: (a: number) => number;
    readonly lua_gettop: (a: number) => number;
    readonly lua_settop: (a: number, b: number) => void;
    readonly check_script: (a: number, b: number) => number;
    readonly check: (a: number, b: number) => [number, number];
    readonly run: (a: number, b: number) => [number, number];
    readonly wasm_start: () => void;
    readonly free: (a: number) => void;
    readonly lua_xmove: (a: number, b: number, c: number) => void;
    readonly lua_pushnil: (a: number) => void;
    readonly lua_type: (a: number, b: number) => number;
    readonly lua_pushnumber: (a: number, b: number) => void;
    readonly sysconf: (a: number) => number;
    readonly mprotect: (a: number, b: number, c: number) => number;
    readonly lua_l_checkboolean: (a: number, b: number) => number;
    readonly lua_pushboolean: (a: number, b: number) => void;
    readonly lua_isstring: (a: number, b: number) => number;
    readonly munmap: (a: number, b: number) => number;
    readonly mmap: (a: number, b: number, c: number, d: number, e: number, f: bigint) => number;
    readonly lua_setthreaddata: (a: number, b: number) => void;
    readonly lua_l_newmetatable: (a: number, b: number) => number;
    readonly luaB_xpcallerr: (a: number, b: number) => void;
    readonly int64_bor: (a: number) => number;
    readonly lua_l_checkinteger_64: (a: number, b: number) => bigint;
    readonly int64_max: (a: number) => number;
    readonly int64_min: (a: number) => number;
    readonly int64_rshift: (a: number) => number;
    readonly int64_ule: (a: number) => number;
    readonly luaC_barrierback: (a: number, b: number, c: number) => void;
    readonly lua_b_print: (a: number) => number;
    readonly lua_pushvector_lua_state_f32_f32_f32_f32: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly lua_userdatadirectfield_setinteger64: (a: number, b: bigint) => void;
    readonly lua_v_tryfunc_tm: (a: number, b: number) => void;
    readonly math_atan2: (a: number) => number;
    readonly math_tan: (a: number) => number;
    readonly tisfrozen: (a: number) => number;
    readonly luaH_new: (a: number, b: number, c: number) => number;
    readonly lua_userdatadirectfield_setinteger_64: (a: number, b: bigint) => void;
    readonly auxwrapy: (a: number) => number;
    readonly int_64_ugt: (a: number) => number;
    readonly class_classof: (a: number) => number;
    readonly class_isinstance: (a: number) => number;
    readonly lua_g_pusherror: (a: number, b: number) => void;
    readonly lua_d_callny: (a: number, b: number, c: number) => void;
    readonly luaL_checkinteger64: (a: number, b: number) => bigint;
    readonly lua_l_optinteger_64: (a: number, b: number, c: bigint) => bigint;
    readonly math_max: (a: number) => number;
    readonly math_min: (a: number) => number;
    readonly math_sin: (a: number) => number;
    readonly str_find: (a: number) => number;
    readonly str_find_aux: (a: number, b: number) => number;
    readonly cocreate: (a: number) => number;
    readonly cowrap: (a: number) => number;
    readonly coyield: (a: number) => number;
    readonly coyieldable: (a: number) => number;
    readonly clock: () => number;
    readonly str_split: (a: number) => number;
    readonly str_sub: (a: number) => number;
    readonly str_match: (a: number) => number;
    readonly str_len: (a: number) => number;
    readonly gmatch: (a: number) => number;
    readonly str_char: (a: number) => number;
    readonly str_byte: (a: number) => number;
    readonly lua_l_getmetafield: (a: number, b: number, c: number) => number;
    readonly codepoint: (a: number) => number;
    readonly int64_create: (a: number) => number;
    readonly int64_tonumber: (a: number) => number;
    readonly iter_aux: (a: number) => number;
    readonly luaC_step: (a: number, b: number) => number;
    readonly luaL_findtable: (a: number, b: number, c: number, d: number) => number;
    readonly strchr: (a: number, b: number) => number;
    readonly lua_pushvector_lua_state_f32_f32_f32: (a: number, b: number, c: number, d: number) => void;
    readonly math_clamp: (a: number) => number;
    readonly math_isinf: (a: number) => number;
    readonly math_sinh: (a: number) => number;
    readonly math_tanh: (a: number) => number;
    readonly utflen: (a: number) => number;
    readonly luaH_setnum: (a: number, b: number, c: number) => number;
    readonly luaF_close: (a: number, b: number) => void;
    readonly realloc: (a: number, b: number) => number;
    readonly malloc: (a: number) => number;
    readonly luaA_pushvalue: (a: number, b: number) => void;
    readonly luaF_recordhit: (a: number, b: number, c: number, d: number) => number;
    readonly luaH_clone: (a: number, b: number) => number;
    readonly luaV_equalval: (a: number, b: number, c: number) => number;
    readonly lua_b_rawset: (a: number) => number;
    readonly lua_singlestep: (a: number, b: number) => void;
    readonly lua_stackdepth: (a: number) => number;
    readonly math_cos: (a: number) => number;
    readonly math_deg: (a: number) => number;
    readonly math_ldexp: (a: number) => number;
    readonly math_sign: (a: number) => number;
    readonly tfind: (a: number) => number;
    readonly lua_l_argerror_l: (a: number, b: number, c: number, d: number) => void;
    readonly utfchar: (a: number) => number;
    readonly luaF_findupval: (a: number, b: number) => number;
    readonly int64_le: (a: number) => number;
    readonly int64_mul: (a: number) => number;
    readonly luaG_isnative: (a: number, b: number) => number;
    readonly luaT_objtypenamestr: (a: number, b: number) => number;
    readonly luaV_doarithimpl_TM_ADD: (a: number, b: number, c: number, d: number) => void;
    readonly luaV_doarithimpl_TM_DIV: (a: number, b: number, c: number, d: number) => void;
    readonly luaV_doarithimpl_TM_IDIV: (a: number, b: number, c: number, d: number) => void;
    readonly luaV_doarithimpl_TM_MOD: (a: number, b: number, c: number, d: number) => void;
    readonly luaV_doarithimpl_TM_MUL: (a: number, b: number, c: number, d: number) => void;
    readonly luaV_doarithimpl_TM_POW: (a: number, b: number, c: number, d: number) => void;
    readonly luaV_doarithimpl_TM_SUB: (a: number, b: number, c: number, d: number) => void;
    readonly luaV_doarithimpl_TM_UNM: (a: number, b: number, c: number, d: number) => void;
    readonly lua_b_getmetatable: (a: number) => number;
    readonly lua_b_next: (a: number) => number;
    readonly lua_b_pairs: (a: number) => number;
    readonly lua_l_callmeta: (a: number, b: number, c: number) => number;
    readonly lua_userdatadirectfield_setvector_void_f32_f32_f32: (a: number, b: number, c: number, d: number) => void;
    readonly lua_v_prepare_forn: (a: number, b: number, c: number, d: number) => void;
    readonly math_pow: (a: number) => number;
    readonly vector_angle: (a: number) => number;
    readonly vector_clamp: (a: number) => number;
    readonly luaT_gettm: (a: number, b: number, c: number) => number;
    readonly luaU_newudata: (a: number, b: number, c: number) => number;
    readonly luaV_lessthan: (a: number, b: number, c: number) => number;
    readonly localtime_r: (a: number, b: number) => number;
    readonly auxresumecont: (a: number, b: number) => number;
    readonly int64_lrotate: (a: number) => number;
    readonly int64_uge: (a: number) => number;
    readonly luaV_lessequal: (a: number, b: number, c: number) => number;
    readonly lua_g_hasnative: (a: number, b: number) => number;
    readonly math_floor: (a: number) => number;
    readonly math_sqrt: (a: number) => number;
    readonly tclear: (a: number) => number;
    readonly scanformat: (a: number, b: number, c: number, d: number) => number;
    readonly tunpack: (a: number) => number;
    readonly coresumefinish: (a: number, b: number) => number;
    readonly foreach: (a: number) => number;
    readonly int64_div: (a: number) => number;
    readonly int64_mod: (a: number) => number;
    readonly int64_neg: (a: number) => number;
    readonly int64_rrotate: (a: number) => number;
    readonly iter_codes: (a: number) => number;
    readonly luaM_getnextpage: (a: number) => number;
    readonly lua_b_ipairs: (a: number) => number;
    readonly lua_b_rawlen: (a: number) => number;
    readonly lua_setlightuserdataname: (a: number, b: number, c: number) => void;
    readonly lua_userdatadirectfield_setvector_void_f32_f32_f32_f32: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly math_atan: (a: number) => number;
    readonly math_fmod: (a: number) => number;
    readonly tconcat: (a: number) => number;
    readonly foreachi: (a: number) => number;
    readonly getn: (a: number) => number;
    readonly tinsert: (a: number) => number;
    readonly tremove: (a: number) => number;
    readonly tsort: (a: number) => number;
    readonly tpack: (a: number) => number;
    readonly tcreate: (a: number) => number;
    readonly tfreeze: (a: number) => number;
    readonly tclone: (a: number) => number;
    readonly lua_l_optlstring: (a: number, b: number, c: number, d: number) => number;
    readonly strtoull: (a: number, b: number, c: number) => bigint;
    readonly luaL_checkoption: (a: number, b: number, c: number, d: number) => number;
    readonly int64_btest: (a: number) => number;
    readonly int64_fromstring: (a: number) => number;
    readonly int64_lshift: (a: number) => number;
    readonly luaC_allocationrate: (a: number) => bigint;
    readonly lua_b_inext: (a: number) => number;
    readonly pusherror: (a: number, b: number) => void;
    readonly lua_setlocal: (a: number, b: number, c: number) => number;
    readonly time: (a: number) => bigint;
    readonly gmtime_r: (a: number, b: number) => number;
    readonly int64_ge: (a: number) => number;
    readonly int64_udiv: (a: number) => number;
    readonly lua_b_gcinfo: (a: number) => number;
    readonly lua_encodepointer: (a: number, b: number) => number;
    readonly lua_setuserdatametatable: (a: number, b: number) => void;
    readonly lua_status: (a: number) => number;
    readonly lua_userdatadirectfield_setnumber: (a: number, b: number) => void;
    readonly math_exp: (a: number) => number;
    readonly math_map: (a: number) => number;
    readonly math_abs: (a: number) => number;
    readonly math_acos: (a: number) => number;
    readonly math_cosh: (a: number) => number;
    readonly math_frexp: (a: number) => number;
    readonly math_modf: (a: number) => number;
    readonly math_rad: (a: number) => number;
    readonly math_noise: (a: number) => number;
    readonly math_round: (a: number) => number;
    readonly math_lerp: (a: number) => number;
    readonly math_isnan: (a: number) => number;
    readonly math_isfinite: (a: number) => number;
    readonly os_time: (a: number) => number;
    readonly os_difftime: (a: number) => number;
    readonly int64_add: (a: number) => number;
    readonly int64_idiv: (a: number) => number;
    readonly luaV_concat: (a: number, b: number, c: number) => void;
    readonly lua_b_rawequal: (a: number) => number;
    readonly lua_equal: (a: number, b: number, c: number) => number;
    readonly lua_isyieldable: (a: number) => number;
    readonly lua_resumeerror: (a: number, b: number) => number;
    readonly luaC_barriertable: (a: number, b: number, c: number) => void;
    readonly int64_ult: (a: number) => number;
    readonly luaV_dolen: (a: number, b: number, c: number) => void;
    readonly luaV_gettable: (a: number, b: number, c: number, d: number) => void;
    readonly luaV_settable: (a: number, b: number, c: number, d: number) => void;
    readonly lua_b_rawget: (a: number) => number;
    readonly lua_b_typeof: (a: number) => number;
    readonly lua_rawequal: (a: number, b: number, c: number) => number;
    readonly luaH_resizearray: (a: number, b: number, c: number) => void;
    readonly int64_arshift: (a: number) => number;
    readonly int64_band: (a: number) => number;
    readonly int64_lt: (a: number) => number;
    readonly int64_sub: (a: number) => number;
    readonly int_64_bxor: (a: number) => number;
    readonly lua_d_rawrunprotected_mut: (a: number, b: number, c: number) => number;
    readonly lua_l_checkudata: (a: number, b: number, c: number, d: number) => number;
    readonly lua_lessthan: (a: number, b: number, c: number) => number;
    readonly int64_extract: (a: number) => number;
    readonly int64_urem: (a: number) => number;
    readonly luaD_seterrorobj: (a: number, b: number, c: number) => void;
    readonly luaG_getline: (a: number, b: number) => number;
    readonly luaG_onbreak: (a: number) => number;
    readonly luaH_getn: (a: number) => number;
    readonly lua_b_type: (a: number) => number;
    readonly lua_d_performcally: (a: number, b: number, c: number) => number;
    readonly lua_getargument: (a: number, b: number, c: number) => number;
    readonly lua_l_buffinit: (a: number, b: number) => void;
    readonly lua_userdatadirectfield_setboolean: (a: number, b: number) => void;
    readonly luai_num2str: (a: number, b: number) => number;
    readonly byteoffset: (a: number) => number;
    readonly luaD_checkCstack: (a: number) => void;
    readonly luaD_growCI: (a: number) => number;
    readonly lua_b_tostring: (a: number) => number;
    readonly lua_isthreadreset: (a: number) => number;
    readonly lua_pushinteger_64: (a: number, b: bigint) => void;
    readonly lua_userdatadirectfield_setnil: (a: number) => void;
    readonly lua_b_assert: (a: number) => number;
    readonly luaF_newLclosure: (a: number, b: number, c: number, d: number) => number;
    readonly int64_clamp: (a: number) => number;
    readonly int64_gt: (a: number) => number;
    readonly int64_rem: (a: number) => number;
    readonly int_64_bnot: (a: number) => number;
    readonly luaA_pushclass: (a: number, b: number) => void;
    readonly lua_getlocal: (a: number, b: number, c: number) => number;
    readonly luaC_barrierf: (a: number, b: number, c: number) => void;
    readonly luau_set_compile_constant_number: (a: number, b: number) => void;
    readonly ast_expr_type_assertion_ast_expr_type_assertion: (a: number, b: number, c: number, d: number) => void;
    readonly ast_stat_for_visit: (a: number, b: number) => void;
    readonly cst_expr_type_assertion_cst_expr_type_assertion: (a: number, b: number) => void;
    readonly ast_expr_table_ast_expr_table: (a: number, b: number, c: number) => void;
    readonly ast_stat_for_in_visit: (a: number, b: number) => void;
    readonly cst_stat_assign_cst_stat_assign: (a: number, b: number, c: number, d: number) => void;
    readonly ast_expr_interp_string_ast_expr_interp_string: (a: number, b: number, c: number, d: number) => void;
    readonly ast_generic_type_pack_ast_generic_type_pack: (a: number, b: number, c: number, d: number) => void;
    readonly ast_type_pack_variadic_visit: (a: number, b: number) => void;
    readonly ast_expr_if_else_ast_expr_if_else: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly ast_stat_local_visit: (a: number, b: number) => void;
    readonly cst_expr_index_expr_cst_expr_index_expr: (a: number, b: number, c: number) => void;
    readonly printer_maybe_advance_and_write: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly printer_visualize_block_ast_stat_block: (a: number, b: number) => void;
    readonly printer_write_end: (a: number, b: number) => void;
    readonly ast_expr_if_else_visit: (a: number, b: number) => void;
    readonly cst_expr_interp_string_cst_expr_interp_string: (a: number, b: number, c: number) => void;
    readonly printer_advance: (a: number, b: number) => void;
    readonly ast_expr_function_ast_expr_function: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number) => void;
    readonly ast_expr_call_visit: (a: number, b: number) => void;
    readonly ast_stat_type_alias_visit: (a: number, b: number) => void;
    readonly ast_type_error_ast_type_error: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly ast_expr_local_ast_expr_local: (a: number, b: number, c: number, d: number) => void;
    readonly cst_type_pack_generic_cst_type_pack_generic: (a: number, b: number) => void;
    readonly ast_generic_type_pack_visit: (a: number, b: number) => void;
    readonly ast_generic_type_visit: (a: number, b: number) => void;
    readonly cst_generic_type_pack_cst_generic_type_pack: (a: number, b: number, c: number) => void;
    readonly cst_type_singleton_string_cst_type_singleton_string: (a: number, b: number, c: number, d: number) => void;
    readonly ast_attr_as_attr: (a: number) => number;
    readonly ast_stat_class_ast_stat_class: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly cst_generic_type_cst_generic_type: (a: number, b: number) => void;
    readonly cst_stat_for_cst_stat_for: (a: number, b: number, c: number, d: number, e: number) => void;
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
