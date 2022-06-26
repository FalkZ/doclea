import {
  DirectoryEntry,
  Entry,
  WritableDirectoryEntry,
  type FileEntry
} from '../new-interface/SFBaseEntry'
import {
  TransactionalEntry,
  TransactionalWritableDirectoryEntry,
  type TransactionalDirectoryEntry,
  type TransactionalWritableFileEntry
} from '../new-interface/TransactionalEntry'
import { SFError } from '../SFError'
import { SFFile } from '../SFFile'
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
  parent: TransactionalDirDecorator
  content: Writable<SFFile> | null
}

export const fileStateFromInnerEntry = (
  parent: TransactionalDirDecorator,
  innerEntry: FileEntry
): FileEntryState => ({
  innerEntry: innerEntry,
  parent: parent,
  name: innerEntry.name,
  content: null
})

export const fileStateForNewEntry = (
  parent: TransactionalDirDecorator,
  name: string
): FileEntryState => ({
  innerEntry: null,
  parent: parent,
  name: name,
  content: writable(new SFFile())
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

  private getCurrentContent(): Result<Writable<SFFile>, SFError> {
    // TODO
    throw new Error('Method not implemented.')
  }

  // ================================================================================
  // PERMANENT ACTIONS

  // ================================================================================
  // TEMPORARY UPDATE ACTIONS

  updateContent(content: BlobPart): OkOrError<SFError> {
    content.
  }
  public async updateFile(file: File): OkOrError<SFError> {
    new File([await file.arrayBuffer()], file.name)
    return this.updateName(file.name).then(() => {
      
      file.arrayBuffer().then(data => new Uint8Array(data).buffer)
      .then
      this.updateContent()
    })
  }

  // ================================================================================

  public watchContent(): Result<Readable<SFFile>, SFError> {
    return this.getCurrentContent()
  }
  read(): Result<SFFile, SFError> {
    this.getCurrentContent()
    throw new Error('Method not implemented.')
  }

  downloadEntry(): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  // ================================================================================

  public getParent(): Result<TransactionalDirectoryEntry, SFError> {
    return new Result((resolve) => {
      resolve(this.currentState.parent)
    })
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
