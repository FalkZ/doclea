import { SFError } from '../../lib/SFError'
import { SFFile } from '../../lib/SFFile'
import type { StorageFrameworkDirectoryEntry } from '../../lib/StorageFrameworkEntry'
import type { StorageFrameworkReadonlyFileEntry } from '../../lib/StorageFrameworkFileEntry'
import { Result, type OkOrError } from '../../lib/utilities'
import { downloadFile } from '../../lib/utilities/downloadFile'
import type { LocalFallbackDirectoryEntry } from './LocalFallbackDirectoryEntry'

/**
 * Contains all methods for LocalFallbackFileEntry
 */
export class LocalFallbackFileEntry
  implements StorageFrameworkReadonlyFileEntry
{
  readonly isDirectory: false
  readonly isFile: true
  readonly fullPath: string
  private file: File
  private readonly parent: LocalFallbackDirectoryEntry
  public readonly isReadonly: true = true

  get name(): string {
    return this.file.name
  }

  get lastModified(): number {
    return this.file.lastModified
  }

  constructor(file: File, parent: LocalFallbackDirectoryEntry) {
    this.file = file
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
      resolve(this.file)
    })
  }

  /**
   * Saves file
   * @param {File} file
   * @returns {SFError} on error
   */
  save(file: File): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      if (typeof file === 'string') {
        this.file = new SFFile(this.name, this.lastModified, [file])
      } else if (file instanceof File) {
        this.file = file
        resolve()
      } else {
        reject(new SFError('file must be instanceof File or typeof string'))
      }
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
      this.file = new SFFile(name, this.lastModified, [this.file])
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
