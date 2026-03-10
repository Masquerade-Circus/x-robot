export declare type Result<T, E> = Ok<T, never> | Err<never, E>;
export declare type Results<T, E> = Result<T, E>[];
export declare class Ok<T, E> {
    value: T;
    constructor(value: T);
    isOk(): this is Ok<T, never>;
    isErr(): this is Err<never, E>;
    unwrap(): T;
    unwrapErr(): never;
}
export declare class Err<T, E> {
    error: E;
    constructor(error: E);
    isOk(): this is Ok<T, never>;
    isErr(): this is Err<never, E>;
    unwrap(): never;
    unwrapErr(): E;
}
export declare function ok<T>(value: T): Ok<T, never>;
export declare function err<E>(err: E): Err<never, E>;
export declare function combine<T, E>(results: Results<T, E>): Result<T, E> | Results<T, E>;
