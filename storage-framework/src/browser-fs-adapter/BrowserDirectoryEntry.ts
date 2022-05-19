import { SFError } from '../lib/SFError'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry
} from '../lib/StorageFrameworkEntry'
import { StorageFrameworkFileEntry } from '../lib/StorageFrameworkFileEntry'
import { Result } from '../lib/utilities'
import type { OkOrError } from '../lib/utilities'
import { BrowserFileEntry } from './BrowserFileEntry'

/**
 * Contains all methods for BrowserDirectoryEntry
 */
export default class BrowserDirectoryEntry
  implements StorageFrameworkDirectoryEntry
{
  readonly isDirectory: true
  readonly isFile: false
  readonly fullPath: string
  readonly name: string
  private directory: FileSystemDirectoryEntry
  private parent: BrowserDirectoryEntry

  constructor(directory: FileSystemDirectoryEntry) {
    this.directory = directory
    this.name = directory.name
    this.fullPath = directory.fullPath
    this.isDirectory = true
    this.isFile = false
    this.directory.getParent((parent) => {
      this.parent = new BrowserDirectoryEntry(<FileSystemDirectoryEntry>parent)
    })
  }

  /**
  * Gets directory entry
  * @returns {FileSystemDirectoryEntry} Returns directory
  */
  getDirectoryEntry() {
    return this.directory
  }

  /**
  * Gets children of directory entry
  * @returns {StorageFrameworkEntry[]} on success
  * @returns {SFError} on error
  */
  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result((resolve, reject) => {
      const reader = this.directory.createReader()
      reader.readEntries(
        (results) => {
          resolve(
            results.map((entry) => {
              if (entry.isDirectory)
                return new BrowserDirectoryEntry(
                  <FileSystemDirectoryEntry>entry
                )
              else return new BrowserFileEntry(<FileSystemFileEntry>entry)
            })
          )
        },
        (error) =>
          reject(
            new SFError(
              `Failed to get directory entries in ${this.fullPath}`,
              error
            )
          )
      )
    })
  }

  /**
  * Creates file in entry
  * @param {string} name
  * @returns {StorageFrameworkFileEntry} on success
  * @returns {SFError} on error
  */
  createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    return new Result((resolve, reject) => {
      this.directory.getFile(
        name,
        { create: true },
        (file) => {
          let fileEntry = new BrowserFileEntry(<FileSystemFileEntry>file)
          resolve(fileEntry)
        },
        (err) =>
          reject(
            new SFError(
              `Failed to create file ${name} in ${this.fullPath}`,
              err
            )
          )
      )
    })
  }

  /**
  * Creates directory in entry
  * @param {string} name
  * @returns {StorageFrameworkDirectoryEntry} on success
  * @returns {SFError} on error
  */
  createDirectory(
    name: string
  ): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      this.directory.getDirectory(
        name,
        { create: true },
        (folder) =>
          resolve(new BrowserDirectoryEntry(<FileSystemDirectoryEntry>folder)),
        (err) =>
          reject(
            new SFError(
              `Failed to create directory ${name} in ${this.fullPath}`,
              err
            )
          )
      )
    })
  }

  /**
  * Gets parent of directory entry
  * @returns {StorageFrameworkDirectoryEntry} on success
  * @returns {SFError} on error
  */
  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
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
  * Moves directory
  * @param {StorageFrameworkDirectoryEntry} directory
  * @returns {SFError} on error
  */
  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.directory.moveTo(
        (<BrowserDirectoryEntry>directory).getDirectoryEntry(),
        this.name,
        () => {
          this.parent = <BrowserDirectoryEntry>directory
          resolve()
        },
        (err) =>
          reject(
            new SFError(
              `Failed to move ${this.fullPath} to ${directory.fullPath}`,
              err
            )
          )
      )
    })
  }

  /**
  * Renames directory
  * @param {string} name
  * @returns {SFError} on error
  */
  rename(name: string): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.directory.moveTo(
        this.parent,
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
  * Removes directory
  * @returns {SFError} on error
  */
  remove(): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.directory.remove(
        () => resolve(),
        (err) =>
          reject(
            new SFError(
              `Failed to remove directory ${this.fullPath}. Note that only empty directories can be removed.`,
              err
            )
          )
      )
    })
  }
}
