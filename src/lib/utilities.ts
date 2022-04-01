export type none = undefined | null

interface ResultLike<T, E> {
  then<T2 = T, E2 = E>(
    onfulfilled?: ((value: T) => T2 | ResultLike<T2, E> | this) | none,
    onrejected?: ((reason: E) => E2 | ResultLike<T, E2> | this) | none
  ): this
}
export interface Result<T, E> extends ResultLike<T, E> {
  catch<E2 = E>(
    onrejected?: ((reason: E) => E2 | Result<T, E2> | this) | none
  ): this
}

interface ResultConstructor extends PromiseConstructor {
  new <T, E>(
    executor: (
      resolve: (value: T | ResultLike<T, E>) => void,
      reject: (reason: E) => void
    ) => void
  ): Result<T, E>
}

export const Result: ResultConstructor = class Result<T> extends Promise<T> {}

export type OkOrError<E extends Error> = Result<void, E>
