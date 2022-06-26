import type { Entry, DirectoryEntry } from '../new-interface/SFBaseEntry'
import type {
  TransactionalEntry,
  TransactionalWritableDirectoryEntry
} from '../new-interface/TransactionalEntry'
import type { SFError } from '../SFError'
import type { OkOrError, Result } from '../utilities'
import type { Readable } from '../utilities/stores'

export class TransactionalDirectoryEntry
  implements TransactionalWritableDirectoryEntry
{
  isReadonly: false
  wasModified: Readable<boolean>
  baseEntry: Entry

  _getBaseEntry(): Entry {
    return this.baseEntry
  }

  constructor(baseEntry: Entry) {
    this.baseEntry = baseEntry
  }

  updateName(name: string): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }
  saveEntry(): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }
  watchChildren(): Result<Readable<TransactionalEntry[]>, SFError> {
    throw new Error('Method not implemented.')
  }
  delete(): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }
  moveTo(directory: TransactionalWritableDirectoryEntry): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }
  isDirectory: true
  isFile: false
  isRoot: boolean
  getChildren(): Result<Entry[], SFError> {
    throw new Error('Method not implemented.')
  }
  fullPath: string
  name: string
  getParent(): Result<DirectoryEntry | null, SFError> {
    throw new Error('Method not implemented.')
  }
}
