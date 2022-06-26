import type { WritableFileEntry } from '../lib/new-interface/SFBaseEntry'
import { SFError } from '../lib/SFError'
import { SFFile } from '../lib/SFFile'
import type { StorageFrameworkDirectoryEntry } from '../lib/StorageFrameworkEntry'
import type { StorageFrameworkFileEntry } from '../lib/StorageFrameworkFileEntry'
import { downloadFile } from '../lib/utilities/downloadFile'
import { Result, type OkOrError } from '../lib/utilities/result'
import type { LocalDirectoryEntry } from './LocalDirectoryEntry'

/**
 * Contains all methods for LocalFileEntry
 */
export class LocalFileEntry implements WritableFileEntry {
  readonly isDirectory: false = false
  readonly isFile: true = true
  public wasModified: boolean = false
  readonly fullPath: string
  readonly name: string
  readonly lastModified: number
  private readonly parent: LocalDirectoryEntry
  private readonly fileHandle: FileSystemFileHandle
  private file: File

  public isReadonly: false = false

  constructor(fileHandle: FileSystemFileHandle, parent: LocalDirectoryEntry) {
    this.fileHandle = fileHandle
    this.name = fileHandle.name
    this.parent = parent
  }

  update(file: File | string): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      if (typeof file === 'string') {
        this.file = new SFFile(this.name, [file])
        this.wasModified = true
      } else if (file instanceof File) {
        this.file = file
        this.wasModified = true
        resolve()
      } else {
        reject(new SFError('file must be instanceof File or typeof string'))
      }
    })
  }

  /**
   * Reads file
   * @returns {SFFile} on success
   * @returns {SFError} on error
   */
  read(): Result<SFFile, SFError> {
    return new Result(async (resolve, reject) => {
      try {
        this.file = new SFFile(this.name, [
          this.file || (await this.fileHandle.getFile())
        ])
        resolve(this.file)
      } catch (err) {
        reject(new SFError(`Failed to read local file ${this.fullPath}.`, err))
      }
    })
  }

  /**
   * Saves file
   * @param {File} file
   * @returns {SFError} on error
   */
  write(file): OkOrError<SFError> {
    return new Result(async (resolve, reject) => {
      try {
        const writable = await this.fileHandle.createWritable()
        await writable.write(file)
        await writable.close()
        this.wasModified = false
        resolve()
      } catch (err) {
        reject(new SFError(`Failed to write local file ${this.fullPath}.`, err))
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
      if (this.parent) resolve(this.parent)
      else {
        const errMsg = `File ${this.fullPath} has no parent.`
        reject(new SFError(errMsg, new Error(errMsg)))
      }
    })
  }

  /**
   * TODO: implement
   * Moves file
   * @param {StorageFrameworkDirectoryEntry} directory
   * @returns {SFError} on error
   */
  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  /**
   * TODO: implement
   * Renames file
   * @param {string} name
   * @returns {SFError} on error
   */
  async rename(name: string): OkOrError<SFError> {
    this.file = new File([await this.file.arrayBuffer()], name)
    await this.delete()
    this.parent.createFile(this.file)
  }

  /**
   * Removes file
   * @returns {SFError} on error
   */
  delete(): OkOrError<SFError> {
    return this.parent.removeEntry(this.name)
  }
}
