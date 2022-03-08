export interface Result<T, E> extends Promise<T> {
  reject(error: E): Result<T, E>
}

export type OkOrError<E extends Error> = Result<void, E>
