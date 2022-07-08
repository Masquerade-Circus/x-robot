/**
 * @module x-robot/validate
 * @description A class that represents the result of a validation.
 * */
export type Result<T, E> = Ok<T, never> | Err<never, E>;

export type Results<T, E> = Result<T, E>[];

export class Ok<T, E> {
  constructor(public value: T) {}
  isOk(): this is Ok<T, never> {
    return true;
  }

  isErr(): this is Err<never, E> {
    return false;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapErr(): never {
    throw new Error("Called `unwrapErr()` on an `Ok` value.");
  }
}

export class Err<T, E> {
  constructor(public error: E) {}

  isOk(): this is Ok<T, never> {
    return false;
  }

  isErr(): this is Err<never, E> {
    return true;
  }

  unwrap(): never {
    throw new Error("Called `unwrap()` on an `Err` value.");
  }

  unwrapErr(): E {
    return this.error;
  }
}

// Utility functions
export function ok<T>(value: T): Ok<T, never> {
  return new Ok(value);
}

export function err<E>(err: E): Err<never, E> {
  return new Err(err);
}

export function combine<T, E>(
  results: Results<T, E>
): Result<T, E> | Results<T, E> {
  for (const result of results) {
    if (result.isErr()) {
      return result;
    }
  }
  return results;
}
