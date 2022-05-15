import type { SFError } from '../../lib/SFError'
import { SFFile } from '../../lib/SFFile'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkFileEntry
} from '../../lib/StorageFrameworkEntry'
import { Result, type OkOrError } from '../../lib/utilities'
import type { LocalFallbackDirectoryEntry } from './LocalFallbackDirectoryEntry'

/**
 * Contains all methods for LocalFallbackFileEntry
 */
export class LocalFallbackFileEntry implements StorageFrameworkFileEntry {
  name: string
  readonly isDirectory: false
  readonly isFile: true
  readonly fullPath: string
  readonly lastModified: number
  private file: File
  private readonly parent: LocalFallbackDirectoryEntry

  constructor(file: File, parent: LocalFallbackDirectoryEntry) {
    this.file = file
    this.name = file.name
    this.lastModified = file.lastModified
    this.fullPath = '/' + file.webkitRelativePath
    this.isDirectory = false
    this.isFile = true
    this.parent = parent
  }

  /**
  * Reads file
  * @returns {SFFile} on success
  * @returns {SFError} on error
  */
  read(): Result<SFFile, SFError> {
    return new Result((resolve, reject) => {
      if (this.file)
        resolve(new SFFile(this.name, this.lastModified, [this.file]))
    })
  }

  /**
  * Saves file
  * @param {File} file
  * @returns {SFError} on error
  */
  save(file: File): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.file = file
      resolve()
    })
  }

  /**
  * Gets parent of file
  * @returns {StorageFrameworkDirectoryEntry} on success
  * @returns {SFError} on error
  */
  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      resolve(this.parent)
    })
  }

  /**
  * Moves file
  * @param {StorageFrameworkDirectoryEntry} directory
  * @returns {SFError} on error
  */
  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  /**
  * Renames file
  * @param {string} name
  * @returns {SFError} on error
  */
  rename(name: string): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.name = name
      resolve()
    })
  }

  /**
  * Removes file
  * @returns {SFError} on error
  */
  remove(): OkOrError<SFError> {
    return new Result(async (resolve, reject) => {
      try {
        await this.parent.removeChild(this.name)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
}
