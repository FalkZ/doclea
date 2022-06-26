import {
  DirectoryEntry,
  Entry,
  WritableDirectoryEntry,
  type FileEntry
} from '../new-interface/SFBaseEntry'
import {
  TransactionalEntry,
  TransactionalWritableDirectoryEntry,
  type TransactionalWritableFileEntry
} from '../new-interface/TransactionalEntry'
import { SFError } from '../SFError'
import type { SFFile } from '../SFFile'
import { OkOrError, Result } from '../utilities'
import { Readable, writable, type Writable } from '../utilities/stores'
import {
  BaseTransactionalDecorator,
  type BaseEntryState
} from './BaseDecorator'
import type { TransactionalDirDecorator } from './DirDecorator'

// ================================================================================
// STATE

interface FileEntryState extends BaseEntryState {
  readonly innerEntry: FileEntry | null
  content: Writable<SFFile> | null
}

const stateFromInnerEntry = (
  parent: TransactionalDirDecorator,
  innerEntry: FileEntry
): FileEntryState => ({
  innerEntry: innerEntry,
  parent: parent,
  name: innerEntry.name,
  content: null
})

// ================================================================================
// FILE ENTRY

export class TransactionalFileDecorator
  extends BaseTransactionalDecorator<FileEntryState>
  implements TransactionalWritableFileEntry
{
  public constructor(savedState: FileEntryState, currentState: FileEntryState) {
    super(savedState, currentState)
  }

  // ================================================================================
  // INTERNAL METHODS

  // ================================================================================
  // PERMANENT ACTIONS

  // ================================================================================
  // TEMPORARY UPDATE ACTIONS

  // ================================================================================

  watchContent(): Result<Readable<SFFile>, SFError> {
    throw new Error('Method not implemented.')
  }

  updateContent(content: BlobPart): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }
  updateFile(file: File): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }
  downloadEntry(): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }
  getParent(): Result<DirectoryEntry | null, SFError> {
    throw new Error('Method not implemented.')
  }
  read(): Result<SFFile, SFError> {
    throw new Error('Method not implemented.')
  }

  // ================================================================================
  // CONSTANT PROPERTIES

  public get isReadonly(): false {
    return false
  }

  public get isDirectory(): false {
    return false
  }

  public get isFile(): true {
    return true
  }
}
