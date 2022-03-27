import { SFError } from '@lib/SFError'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry,
  StorageFrameworkFileEntry,
} from '@lib/StorageFrameworkEntry'
import { Result } from '@lib/utilities'
import { InMemoryFile } from './InMemoryFile'
import { InMemoryFSEntry } from './InMemoryFSEntry'

export class InMemoryDirectory
  extends InMemoryFSEntry
  implements StorageFrameworkDirectoryEntry
{
  private children: InMemoryFSEntry[] = []

  constructor(parent: InMemoryDirectory | null, name: string) {
    super(parent, name)
  }

  get isDirectory(): true {
    return true
  }
  get isFile(): false {
    return false
  }

  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result((resolve, reject) => {
      // verify node is attached to the root node
      const error = this.verifyNodeIsAttachedToRoot()
      if (error) {
        reject(error)
        return
      }

      resolve([...this.children])
    })
  }
  createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    return this.appendChild(new InMemoryFile(this, name))
  }
  createDirectory(
    name: string
  ): Result<StorageFrameworkDirectoryEntry, SFError> {
    return this.appendChild(new InMemoryDirectory(this, name))
  }

  // ================================================================================
  // additional methods

  getChildByName(name: string): InMemoryFSEntry | null {
    for (let child of this.children) {
      if (child.name == name) return child
    }
    return null
  }

  hasChildWithName(name: string): SFError | null {
    if (this.getChildByName(name))
      return new SFError(
        `${this.fullPath} already has an entry with name ${name}`
      )

    return null
  }

  hasAnyChild(): boolean {
    return this.children.length > 0
  }

  appendChild<T extends InMemoryFSEntry>(child: T): Result<T, SFError> {
    return new Result((resolve, reject) => {
      {
        // verify node is attached to the root node
        const error = this.verifyNodeIsAttachedToRoot()
        if (error) {
          reject(error)
          return
        }
      }

      {
        // check if the name is already used
        const error = this.hasChildWithName(child.name)
        if (error) {
          reject(error)
          return
        }
      }

      this.children.push(child)
      resolve(child)
    })
  }

  removeChild(child: InMemoryFSEntry) {
    this.children = this.children.filter((n) => n != child)
  }
}
