import type { SFError } from '@lib/SFError'
import type { SFFile } from '@lib/SFFile'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkFileEntry,
} from '@lib/StorageFrameworkEntry'
import type { Result, OkOrError } from '@lib/utitities'
import type LocalDirectoryEntry from './LocalDirectoryEntry'

export class LocalFileEntry implements StorageFrameworkFileEntry {
  isDirectory: false
  isFile: true
  path: string
  constructor(path) {
    this.path = path
  }
  read(): Result<SFFile, SFError> {
    throw new Error('Method not implemented.')
  }
  save(file: File): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }
  fullPath: string
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
