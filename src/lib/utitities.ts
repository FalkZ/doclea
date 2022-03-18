export interface Result<T, E> extends Promise<T> {
  reject(error: E): Result<T, E>
}

export class Result<T, E> extends Promise<T> implements Result<T, E> {}

export type OkOrError<E extends Error> = Result<void, E>
