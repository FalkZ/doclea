import type { SFError } from '../SFError'
import type { OkOrError, Result } from '../utilities'
import type { CreateReadonly, MaybeReadonly } from './CreateReadonly'
import type { ObservableWritableFileEntry } from './ObservableEntry'
import type { WritableDirectoryEntry } from './SFBaseEntry'
import type { Readable as Observable } from '../utilities/stores'

export interface TransactionalWritableFileEntry
  extends Omit<
    CreateReadonly<ObservableWritableFileEntry>,
    'isReadonly' | 'getParent'
  > {
  readonly isReadonly: false
  readonly wasModified: Observable<boolean>
  updateContent(content: BlobPart): OkOrError<SFError>
  saveContent(): OkOrError<SFError>

  downloadEntry(): OkOrError<SFError>

  getParent(): Result<TransactionalDirectoryEntry, SFError>
}

export interface TransactionalWritableDirectoryEntry
  extends Omit<
    CreateReadonly<WritableDirectoryEntry>,
    'isReadonly' | 'getChildren' | 'getParent'
  > {
  readonly isReadonly: false
  createFile(name: string): Result<TransactionalWritableFileEntry, SFError>
  createDirectory(
    name: string
  ): Result<TransactionalWritableDirectoryEntry, SFError>
  watchChildren(): Result<Observable<TransactionalEntry[]>, SFError>

  getParent(): Result<TransactionalDirectoryEntry | null, SFError>
}

export type TransactionalFileEntry =
  MaybeReadonly<TransactionalWritableFileEntry>

export type TransactionalDirectoryEntry =
  MaybeReadonly<TransactionalWritableDirectoryEntry>

export type TransactionalEntry =
  | TransactionalFileEntry
  | TransactionalDirectoryEntry
