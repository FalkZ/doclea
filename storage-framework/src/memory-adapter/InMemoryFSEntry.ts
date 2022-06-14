import { SFError } from '../lib/SFError'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry
} from '../lib/StorageFrameworkEntry'
import { Result, type OkOrError } from '../lib/utilities'
import { InMemoryDirectory } from './InMemoryDirectory'

/**
 * Contains all methods for InMemoryFSEntry
 */
export abstract class InMemoryFSEntry implements StorageFrameworkEntry {
  protected parent: InMemoryDirectory | null
  name: string

  abstract readonly isDirectory: boolean
  abstract readonly isFile: boolean

  constructor(parent: InMemoryDirectory | null, name: string | null) {
    this.parent = parent
    // @ts-ignore
    this.name = this.parent == null ? '' : name
  }

  /**
   * Gets full path of entry
   * @returns {string}
   */
  get fullPath(): string {
    if (this.parent === null) return '/'
    if (this.isDirectory) return this.parent.fullPath + this.name + '/'
    else return this.parent.fullPath + this.name
  }

  /**
   * Gets if entry is root
   * @returns {boolean}
   */
  get isRoot(): boolean {
    return this.parent == null && this.isDirectory
  }

  /**
   * Gets if node is attached to root
   * @returns {boolean}
   */
  isNodeAttachedToRoot(): boolean {
    if (this.isRoot) return true

    if (!this.parent.isNodeAttachedToRoot()) return false

    return this.parent.getChildByName(this.name) === this
  }

  /**
   * Verifies if node is attached to root
   * @returns {null} on success
   * @returns {SFError} on error
   */
  verifyNodeIsAttachedToRoot(): SFError | null {
    if (this.isNodeAttachedToRoot()) return null
    return new SFError(
      'this node is not attached to the root entry: ' + this.fullPath
    )
  }

  /**
   * Gets parent of directory entry
   * @returns {StorageFrameworkDirectoryEntry} on success
   * @returns {SFError} on error
   */
  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve) => resolve(this.parent))
  }

  /**
   * Renames directory
   * @param {string} name
   * @returns {SFError} on error
   */
  rename(name: string): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      const error = this.verifyNodeIsAttachedToRoot()
      if (error !== null) {
        reject(error)
        return
      }

      if (this.isRoot) {
        reject(new SFError("root node can't be renamed"))
        return
      }

      if (this.parent.getChildByName(name) !== null) {
        reject(
          new SFError(
            `can't rename node ${this.fullPath}, name '${name}' is already used`
          )
        )
      } else {
        this.name = name
        resolve()
      }
    })
  }

  /**
   * Removes directory
   * @returns {SFError} on error
   */
  remove(): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      const error = this.verifyNodeIsAttachedToRoot()
      if (error !== null) {
        reject(error)
        return
      }

      if (this instanceof InMemoryDirectory && this.hasAnyChild()) {
        reject(
          new SFError(this.fullPath + ': directory must be empty to be removed')
        )
        return
      }

      this.parent.removeChild(this)
      resolve()
    })
  }

  /**
   * Moves directory
   * @param {StorageFrameworkDirectoryEntry} directory
   * @returns {SFError} on error
   */
  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      {
        // verify current node is attached to the root node
        const error = this.verifyNodeIsAttachedToRoot()
        if (error !== null) {
          reject(error)
          return
        }
      }

      // can't move the root node
      if (this.isRoot) {
        reject(new SFError("can't move the root node"))
        return
      }

      // currently moving to a different filesystem is not supported
      // check one: verify directory is also an InMemoryDirectory
      if (!(directory instanceof InMemoryDirectory)) {
        reject(
          new SFError(
            "not implemented: can't move node to a different filesystem type"
          )
        )
        return
      }

      // try moving the node
      const directoryNode: InMemoryDirectory = directory

      directoryNode
        .appendChild(this)
        .then((_) => {
          this.parent.removeChild(this)
          resolve()
        })
        .catch((e) => reject(e))
    })
  }
}
