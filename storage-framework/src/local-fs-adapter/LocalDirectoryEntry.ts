import { SFError } from '../lib/SFError'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry
} from '../lib/StorageFrameworkEntry'
import type { StorageFrameworkFileEntry } from '../lib/StorageFrameworkFileEntry'
import { Result, type OkOrError } from '../lib/utilities/result'
import { LocalFileEntry } from './LocalFileEntry'

/**
 * Contains all methods for LocalDirectoryEntry
 */
export class LocalDirectoryEntry implements StorageFrameworkDirectoryEntry {
  readonly isDirectory: true
  readonly isFile: false
  readonly fullPath: string
  readonly name: string
  readonly isRoot: boolean
  private readonly parent: LocalDirectoryEntry | null
  private readonly directoryHandle: FileSystemDirectoryHandle

  constructor(
    directoryHandle: FileSystemDirectoryHandle,
    parent: LocalDirectoryEntry | null
  ) {
    this.directoryHandle = directoryHandle
    this.parent = parent
    this.isRoot = this.parent ? false : true
    this.name = directoryHandle.name
    this.isFile = false
    this.isDirectory = true
    this.fullPath = this.isRoot
      ? '/' + this.name
      : this.parent?.fullPath + '/' + this.name
  }

  /**
   * Gets children of directory entry
   * @returns {StorageFrameworkEntry[]} on success
   * @returns {SFError} on error
   */
  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result(async (resolve, reject) => {
      const children: StorageFrameworkEntry[] = []

      for await (const value of this.directoryHandle.values()) {
        const child: FileSystemHandle = value
        if (child.kind === 'directory') {
          children.push(
            new LocalDirectoryEntry(<FileSystemDirectoryHandle>child, this)
          )
        } else if (child.kind === 'file') {
          children.push(new LocalFileEntry(<FileSystemFileHandle>child, this))
        }
      }
      resolve(children)
    })
  }

  /**
   * Creates file in entry
   * @param {string} name
   * @returns {StorageFrameworkFileEntry} on success
   * @returns {SFError} on error
   */
  createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    return new Result(async (resolve, reject) => {
      try {
        const fileHandle = await window.showSaveFilePicker()
        resolve(new LocalFileEntry(fileHandle, this))
      } catch (err) {
        reject(new SFError(`Failed to create file ${name}`, err))
      }
    })
  }

  /**
   * TODO: implement
   * Creates directory in entry
   * @param {string} name
   * @returns {StorageFrameworkDirectoryEntry} on success
   * @returns {SFError} on error
   */
  createDirectory(
    name: string
  ): Result<StorageFrameworkDirectoryEntry, SFError> {
    throw new Error('Method not implemented.')
  }

  /**
   * Gets parent of directory entry
   * @returns {StorageFrameworkDirectoryEntry} on success
   * @returns {SFError} on error
   */
  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      if (this.parent) resolve(this.parent)
      else reject(new SFError(`Directory ${this.fullPath} has no parent.`))
    })
  }

  /**
   * TODO: implement
   * Moves directory
   * @param {StorageFrameworkDirectoryEntry} directory
   * @returns {SFError} on error
   */
  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  /**
   * TODO: implement
   * Renames directory
   * @param {string} name
   * @returns {SFError} on error
   */
  rename(name: string): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  /**
   * Removes directory
   * @returns {SFError} on error
   */
  remove(): OkOrError<SFError> {
    return new Result(async (resolve, reject) => {
      if (this.parent) {
        await this.parent.removeEntry(this.name)
        resolve()
      } else {
        const errMsg = `Failed to remove directory ${this.fullPath}`
        reject(new SFError(errMsg))
      }
    })
  }

  /**
   * Removes entry
   * @returns {SFError} on error
   */
  removeEntry(name: string): OkOrError<SFError> {
    return new Result(async (resolve, reject) => {
      try {
        await this.directoryHandle.removeEntry(name)
        resolve()
      } catch (err) {
        reject(new SFError(`Failed to remove entry ${this.fullPath}.`, err))
      }
    })
  }
}
