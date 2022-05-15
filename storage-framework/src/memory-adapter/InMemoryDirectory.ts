import { SFError } from '../lib/SFError'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry,
  StorageFrameworkFileEntry,
} from '../lib/StorageFrameworkEntry'
import { Result } from '../lib/utilities'
import { InMemoryFile } from './InMemoryFile'
import { InMemoryFSEntry } from './InMemoryFSEntry'

/**
 * Contains all methods for BrowserFileEntry
 */
export class InMemoryDirectory
  extends InMemoryFSEntry
  implements StorageFrameworkDirectoryEntry
{
  private children: InMemoryFSEntry[] = []

  /**
  * Gets if entry is a directory or not
  * @returns {boolean[]}
  */
  get isDirectory(): true {
    return true
  }

  /**
  * Gets if entry is a file or not
  * @returns {boolean[]}
  */
  get isFile(): false {
    return false
  }

  /**
  * Gets children of directory entry
  * @returns {StorageFrameworkEntry[]} on success
  * @returns {SFError} on error
  */
  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result((resolve, reject) => {
      // verify node is attached to the root node
      const error = this.verifyNodeIsAttachedToRoot()
      if (error !== null) {
        reject(error)
        return
      }

      resolve([...this.children])
    })
  }

  /**
  * Creates file in entry
  * @param {string} name
  * @returns {StorageFrameworkFileEntry} on success
  * @returns {SFError} on error
  */
  createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    return this.appendChild(new InMemoryFile(this, name))
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
    return this.appendChild(new InMemoryDirectory(this, name))
  }

  // ================================================================================
  // additional methods

  /**
  * Gets child by name
  * @param {string} name
  * @returns {InMemoryFSEntry} on success
  * @returns {null} on error
  */
  getChildByName(name: string): InMemoryFSEntry | null {
    for (const child of this.children) {
      if (child.name === name) return child
    }
    return null
  }

  /**
  * Gets if entry has child by name
  * @param {string} name
  * @returns {SFError} on error
  */
  hasChildWithName(name: string): SFError | null {
    if (this.getChildByName(name) != null)
      return new SFError(
        `${this.fullPath} already has an entry with name ${name}`
      )

    return null
  }

  /**
  * Gets if entry has any child or not
  * @returns {boolean}
  */
  hasAnyChild(): boolean {
    return this.children.length > 0
  }

  /**
  * Appends child
  * @param {T} child
  * @returns {T} on success
  * @returns {SFError} on error
  */
  appendChild<T extends InMemoryFSEntry>(child: T): Result<T, SFError> {
    return new Result((resolve, reject) => {
      {
        // verify node is attached to the root node
        const error = this.verifyNodeIsAttachedToRoot()
        if (error != null) {
          reject(error)
          return
        }
      }

      {
        // check if the name is already used
        const error = this.hasChildWithName(child.name)
        if (error != null) {
          reject(error)
          return
        }
      }

      this.children.push(child)
      resolve(child)
    })
  }

  /**
  * Removes child
  * @param {T} child
  * @returns {T} on success
  * @returns {SFError} on error
  */
  removeChild(child: InMemoryFSEntry): void {
    this.children = this.children.filter((n) => n !== child)
  }
}
