import { Logger } from '../../../../doclea/src/business-logic/Logger'
import { SFError } from '../../lib/SFError'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry
} from '../../lib/StorageFrameworkEntry'
import type { StorageFrameworkFileEntry } from '../../lib/StorageFrameworkFileEntry'
import { Result, type OkOrError } from '../../lib/utilities'
import { PathUtil } from '../../lib/utilities/pathUtil'
import { LocalFallbackFileEntry } from './LocalFallbackFileEntry'

/**
 * use public or private fields
 */
/**
 * Contains all methods for LocalFallbackDirectoryEntry
 */
export class LocalFallbackDirectoryEntry
  implements StorageFrameworkDirectoryEntry
{
  public readonly isDirectory: true
  public readonly isFile: false
  fullPath: string
  name: string
  parent: LocalFallbackDirectoryEntry | null
  public readonly isRoot: boolean
  private children

  constructor(
    name: string,
    children: File[],
    parent: LocalFallbackDirectoryEntry | null
  ) {
    this.name = name
    this.parent = parent
    this.isRoot = parent === null
    this.isDirectory = true
    this.children = {}
    if (this.isRoot) this.fullPath = this.name
    else this.fullPath = this.parent?.fullPath + '/' + this.name
    this.addChildren(children)
  }

  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result((resolve, reject) => {
      resolve(Object.values(this.children))
    })
  }

  /**
   * TODO: try catch and reject error
   * Creates file in entry
   * @param {string} name
   * @returns {StorageFrameworkFileEntry} on success
   * @returns {SFError} on error
   */
  createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    return new Result((resolve, reject) => {
      try {
        const newFile = new LocalFallbackFileEntry(new File([], name), this)
        resolve(newFile)
      } catch (err) {
        reject(new SFError('Failed to create file', err))
      }
    })
  }

  /**
   * TODO: try catch and reject error
   * @param {string} name
   * @returns {StorageFrameworkDirectoryEntry} on success
   * @returns {SFError} on error
   */
  createDirectory(
    name: string
  ): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      const newDirectory = new LocalFallbackDirectoryEntry(name, [], this)
      resolve(newDirectory)
    })
  }

  /**
   * Gets parent of directory entry
   * @returns {StorageFrameworkDirectoryEntry} on success
   * @returns {SFError} on error
   */
  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      if (this.parent) resolve(this.parent)
      else {
        const errMsg = `Directory ${this.fullPath} has no parent`
        reject(new SFError(errMsg, new Error(errMsg)))
      }
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
      if (!this.parent) reject(new SFError('Cannot remove root directory'))
      try {
        await this.parent?.removeChild(this.name)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Removes child
   * @param {string} name
   * @returns {SFError} on error
   */
  removeChild(name: string): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      if (this.children[name]) {
        delete this.children[name]
        resolve()
      } else {
        const errMsg = `Failed to remove ${name}. Entry not found.`
        reject(new SFError(errMsg, new Error(errMsg)))
      }
    })
  }

  /**
   * Checks if entry contains child directory
   * @param {string} name
   * @returns {boolean}
   */
  containsChildDirectory(name: string): boolean {
    return (
      Object.keys(this.children).includes(name) &&
      this.children[name].isDirectory
    )
  }

  /**
   * Gets child directory
   * @param {string} name
   * @returns {LocalFallbackDirectoryEntry}
   */
  getChildDirectory(name: string): LocalFallbackDirectoryEntry {
    return this.children[name]
  }

  /**
   * Add child file
   * @param {string} name
   * @param {File} child
   */
  addChildFile(name: string, child: File): void {
    this.children[name] = new LocalFallbackFileEntry(child, this)
  }

  /**
   * Add child directory
   * @param {string} name
   */
  addChildDirectory(name: string): void {
    this.children[name] = new LocalFallbackDirectoryEntry(name, [], this)
  }

  private addChildren(children: File[]): void {
    /**
     * TODO: refactor, I think this can be implemented a bit easier (with recursion maybe...)
     */
    for (const child of children) {
      const pathUtil = new PathUtil(child.webkitRelativePath)
      const path = pathUtil.path
      const fileName = pathUtil.fileName
      if (fileName && path && path.length > 0) {
        let current: LocalFallbackDirectoryEntry = this
        for (let dirName of path.slice(1)) {
          if (!current.containsChildDirectory(dirName)) {
            current.addChildDirectory(dirName)
          }
          current = current.getChildDirectory(dirName)
        }
        current.addChildFile(fileName, child)
      } else console.error(`Invalid path or file name for file ${child}`)
    }
  }
}
