export type none = undefined | null

export interface Result<T, E> {
  then<T2 = T, E2 = E>(
    onfulfilled?: ((value: T) => T2 | Result<T2, E> | this) | none,
    onrejected?: ((reason: E) => E2 | Result<T, E2> | this) | none
  ): Result<T2, E2>

  catch<E2 = E>(
    onrejected?: ((reason: E) => E2 | Result<T, E2> | this) | none
  ): Result<T, E2>
}

/**
 * A Result is a promise, where return value and error value are defined
 * 
 * An Operation that return T if it succeeds or E if it fails
 */
/*
export interface Result<T, E> extends ResultLike<T, E> {
  catch<E2 = E>(
    onrejected?: ((reason: E) => E2 | Result<T, E2> | this) | none
  ): Result<T, E | E2>
} */

interface ResultConstructor extends PromiseConstructor {
  new <T, E>(
    executor: (
      resolve: (value: T | Result<T, E>) => void,
      reject: (reason: E | Result<T, E>) => void
    ) => void
  ): Result<T, E>
}

export const Result: ResultConstructor = class Result<T> extends Promise<T> {}

/**
 * Represents the special case of a Result where the return type is void
 * 
 * An Operation the either succeeds without return value, or fails with type E
 */
export type OkOrError<E extends Error> = Result<void, E>
