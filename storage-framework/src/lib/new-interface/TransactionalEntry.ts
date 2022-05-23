import type { SFError } from '../SFError'
import type { OkOrError } from '../utilities'
import type { CreateReadonly, MaybeReadonly } from './CreateReadonly'
import type { ObservableWritableFileEntry } from './ObservableEntry'

export interface TransactionalWritableFileEntry
  extends Omit<CreateReadonly<ObservableWritableFileEntry>, 'isReadonly'> {
  readonly isReadonly: false
  updateContent(content: BlobPart): OkOrError<SFError>
  updateName(name: string): OkOrError<SFError>
  updateFile(file: File): OkOrError<SFError>
  downloadEntry(): OkOrError<SFError>
  saveEntry(): OkOrError<SFError>
}

export type TransactionalFileEntry =
  MaybeReadonly<TransactionalWritableFileEntry>
