import type { SFError } from '../SFError'
import type { OkOrError, Result } from '../utilities'
import type { CreateReadonly, MaybeReadonly } from './CreateReadonly'
import type { ObservableWritableFileEntry } from './ObservableEntry'
import type { WritableDirectoryEntry } from './SFBaseEntry'
import type { Readable as Observable } from '../utilities/stores'

export interface TransactionalWritableFileEntry
  extends Omit<CreateReadonly<ObservableWritableFileEntry>, 'isReadonly'> {
  readonly isReadonly: false
  readonly wasModified: Observable<boolean>
  updateContent(content: BlobPart): OkOrError<SFError>
  updateName(name: string): OkOrError<SFError>
  updateFile(file: File): OkOrError<SFError>
  downloadEntry(): OkOrError<SFError>
  saveEntry(): OkOrError<SFError>
  delete(): OkOrError<SFError>
  moveTo(directory: TransactionalWritableDirectoryEntry): OkOrError<SFError>
}

export interface TransactionalWritableDirectoryEntry
  extends Omit<CreateReadonly<WritableDirectoryEntry>, 'isReadonly'> {
  readonly isReadonly: false
  readonly wasModified: Observable<boolean>
  updateName(name: string): OkOrError<SFError>
  saveEntry(): OkOrError<SFError>
  watchChildren(): Result<Observable<TransactionalEntry[]>, SFError>
  delete(): OkOrError<SFError>
  moveTo(directory: TransactionalWritableDirectoryEntry): OkOrError<SFError>
}

export type TransactionalFileEntry =
  MaybeReadonly<TransactionalWritableFileEntry>

export type TransactionalDirectoryEntry =
  MaybeReadonly<TransactionalWritableFileEntry>

export type TransactionalEntry =
  | TransactionalFileEntry
  | TransactionalDirectoryEntry
