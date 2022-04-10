import { SFError } from '../lib/SFError'
import {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry
} from '../lib/StorageFrameworkEntry'
import { Result, OkOrError } from '../lib/utilities'

export class SolidFileEntry implements StorageFrameworkEntry {
  fullPath: string
  isDirectory: boolean
  isFile: boolean
  name: string

  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    throw new Error('Method not implemented.')
  }
  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }
  rename(name: string): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }
  remove(): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }
}
