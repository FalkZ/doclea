import { SFError } from '../../lib/SFError'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry
} from '../../lib/StorageFrameworkEntry'
import { StorageFrameworkFileEntry } from '../../lib/StorageFrameworkFileEntry'
import { Result, type OkOrError } from '../../lib/utilities'
import { LocalFallbackFileEntry } from './LocalFallbackFileEntry'

/**
 * use public or private fields
 */
export class LocalFallbackDirectoryEntry
  implements StorageFrameworkDirectoryEntry
{
  public readonly isDirectory: true
  public readonly isFile: false
  fullPath: string
  name: string
  parent: LocalFallbackDirectoryEntry
  public readonly isRoot: boolean
  private children

  constructor(
    name: string,
    children: File[],
    isRoot: boolean,
    parent: LocalFallbackDirectoryEntry
  ) {
    this.name = name
    this.isRoot = isRoot
    this.parent = parent
    this.isDirectory = true
    this.children = {}
    if (isRoot) this.fullPath = this.name
    else this.fullPath = this.parent.fullPath + '/' + this.name
    this.addChildren(children)
  }

  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result((resolve, reject) => {
      resolve(Object.values(this.children))
    })
  }

  /**
   * TODO: try catch and reject error
   * @param name
   * @returns
   */
  createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    return new Result((resolve, reject) => {
      const newFile = new LocalFallbackFileEntry(new File([], name), this)
      resolve(newFile)
    })
  }

  /**
   * TODO: try catch and reject error
   * @param name
   * @returns
   */
  createDirectory(
    name: string
  ): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      const newDirectory = new LocalFallbackDirectoryEntry(
        name,
        [],
        false,
        this
      )
      resolve(newDirectory)
    })
  }

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
   * @param directory
   */
  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  /**
   * TODO: implement
   * @param directory
   */
  rename(name: string): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  /**
   * TODO: resolve not used
   * @returns
   */
  remove(): OkOrError<SFError> {
    return new Result(async (resolve, reject) => {
      try {
        await this.parent.removeChild(this.name)
      } catch (error) {
        reject(error)
      }
    })
  }

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

  containsChildDirectory(name: string): boolean {
    return (
      Object.keys(this.children).includes(name) &&
      this.children[name].isDirectory
    )
  }

  getChildDirectory(name: string): LocalFallbackDirectoryEntry {
    return this.children[name]
  }

  addChildFile(name: string, child: File): void {
    this.children[name] = new LocalFallbackFileEntry(child, this)
  }

  addChildDirectory(name: string): void {
    this.children[name] = new LocalFallbackDirectoryEntry(name, [], false, this)
  }

  private addChildren(children: File[]): void {
    /**
     * TODO: refactor, I think this can be implemented a bit easier (with recursion maybe...)
     */
    for (const child of children) {
      // TODO: use same utility as solid & github (utility does not exit has to be created first)
      const path = child.webkitRelativePath.match(/[\w_-]+[\/\\]/g)
      const fileName = child.webkitRelativePath
        .match(/[\/\\][\w\ .,:_-]+/g)
        .pop()
        .replace(/[\/\\]/, '')
      if (path.length > 0) {
        // this.name = path[0].replace(/[\/\\]/, '')
        let current: LocalFallbackDirectoryEntry = this
        for (let dirName of path.slice(1)) {
          dirName = dirName.replace(/[/\\]/, '')
          if (!current.containsChildDirectory(dirName)) {
            current.addChildDirectory(dirName)
          }
          current = current.getChildDirectory(dirName)
        }
        current.addChildFile(fileName, child)
      }
    }
  }
}
