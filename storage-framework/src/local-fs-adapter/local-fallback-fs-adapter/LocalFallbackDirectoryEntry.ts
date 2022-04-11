import { SFError } from '../../lib/SFError'
import {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry,
  StorageFrameworkFileEntry
} from '../../lib/StorageFrameworkEntry'
import { Result, OkOrError } from '../../lib/utilities'
import LocalFallbackFileEntry from './LocalFallbackFileEntry'

export default class LocalFallbackDirectoryEntry
  implements StorageFrameworkDirectoryEntry
{
  isDirectory: true
  isFile: false
  fullPath: string
  name: string

  constructor(children: LocalFallbackFileEntry) {}

  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    throw new Error('Method not implemented.')
  }

  createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    throw new Error('Method not implemented.')
  }

  createDirectory(
    name: string
  ): Result<StorageFrameworkDirectoryEntry, SFError> {
    throw new Error('Method not implemented.')
  }

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
