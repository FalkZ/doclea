export type CreateReadonly<T> = Omit<
  T,
  | 'delete'
  | 'createFile'
  | 'createDirectory'
  | 'write'
  | 'saveEntry'
  | 'isReadonly'
> & {
  readonly isReadonly: true
}

export type MaybeReadonly<T> = T | CreateReadonly<T>
