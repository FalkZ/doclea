import { resolveObjectURL } from 'buffer'
import { SFError } from '../../lib/SFError'
import { SFFile } from '../../lib/SFFile'
import {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkFileEntry
} from '../../lib/StorageFrameworkEntry'
import { Result, OkOrError } from '../../lib/utilities'
import LocalFallbackDirectoryEntry from './LocalFallbackDirectoryEntry'

export default class LocalFallbackFileEntry
  implements StorageFrameworkFileEntry
{
  isDirectory: false
  isFile: true
  fullPath: string
  name: string
  private file: File
  private parent: LocalFallbackDirectoryEntry

  constructor(file: File, parent: LocalFallbackDirectoryEntry) {
    this.file = file
    this.name = file.name
    this.fullPath = file.webkitRelativePath
    this.isDirectory = false
    this.isFile = true
    this.parent = parent
  }

  read(): Result<SFFile, SFError> {
    return new Result((resolve, reject) => {
      if (this.file)
        resolve(new SFFile(this.name, this.lastModified, [this.file]))
    })
  }

  save(file: File): OkOrError<SFError> {
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
