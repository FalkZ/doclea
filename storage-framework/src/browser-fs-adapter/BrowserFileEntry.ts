import { SFError } from '../lib/SFError'
import { SFFile } from '../lib/SFFile'
import type { StorageFrameworkDirectoryEntry } from '../lib/StorageFrameworkEntry'
import { StorageFrameworkFileEntry } from '../lib/StorageFrameworkFileEntry'
import { Result, OkOrError } from '../lib/utilities'
import BrowserDirectoryEntry from './BrowserDirectoryEntry'

/**
 * Contains all methods for BrowserFileEntry
 */
export class BrowserFileEntry implements StorageFrameworkFileEntry {
  readonly isDirectory: false
  readonly isFile: true
  readonly fullPath: string
  readonly name: string
  private lastModified: number
  private parent: StorageFrameworkDirectoryEntry
  private file: FileSystemFileEntry

  public constructor(file: FileSystemFileEntry) {
    this.file = file
    this.fullPath = file.fullPath
    this.name = file.name
    this.isDirectory = false
    this.isFile = true
    this.file.file((file) => (this.lastModified = file.lastModified))
    this.file.getParent((parent) => {
      this.parent = new BrowserDirectoryEntry(<FileSystemDirectoryEntry>parent)
    })
  }

  /**
   * Reads file
   * @returns {SFFile} on success
   * @returns {SFError} on error
   */
  public read(): Result<SFFile, SFError> {
    return new Result((resolve, reject) => {
      this.file.file(
        (file) => {
          resolve(new SFFile(this.name, this.lastModified, [file]))
        },
        (err) => reject(new SFError('Failed to read file', err))
      )
    })
  }

  /**
   * Saves file
   * @param {File} file
   * @returns {SFError} on error
   */
  public save(file: File): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.file.createWriter(
        (fileWriter) => {
          fileWriter.write(file)
          console.log('Saved file: ', file)
          resolve()
        },
        (err) => reject(new SFError('Failed to save file', err))
      )
    })
  }

  /**
   * Gets parent of file
   * @returns {StorageFrameworkDirectoryEntry} on success
   * @returns {SFError} on error
   */
  public getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      if (this.parent) {
        resolve(this.parent)
      } else {
        reject(
          new SFError(`Failed to get parent of ${this.fullPath}`, new Error())
        )
      }
    })
  }

  /**
   * Moves file
   * @param {StorageFrameworkDirectoryEntry} directory
   * @returns {SFError} on error
   */
  public moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.file.moveTo(
        (directory as BrowserDirectoryEntry).getDirectoryEntry(),
        this.name,
        () => {
          this.parent = directory
          resolve()
        },
        (err) => reject(new SFError('Failed to move file', err))
      )
    })
  }

  /**
   * Renames file
   * @param {string} name
   * @returns {SFError} on error
   */
  public rename(name: string): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.file.moveTo(
        this.getParent(),
        name,
        () => resolve(),
        (err) =>
          reject(
            new SFError(`Failed to rename ${this.fullPath} to ${name}`, err)
          )
      )
    })
  }

  /**
   * Removes file
   * @returns {SFError} on error
   */
  public remove(): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.file.remove(
        () => resolve(),
        (err) => reject(new SFError(`Failed to remove ${this.fullPath}`, err))
      )
    })
  }
}
