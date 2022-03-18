export type none = undefined | null

interface ResultLike<T, E> {
  then(
    onfulfilled?: ((value: T) => T | this) | none,
    onrejected?: ((reason: E) => E | this) | none
  ): this
}
export interface Result<T, E> extends ResultLike<T, E> {
  catch(onrejected?: ((reason: E) => E | this) | none): this
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
