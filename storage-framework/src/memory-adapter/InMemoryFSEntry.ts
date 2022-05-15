import { SFError } from '../lib/SFError'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry,
} from '../lib/StorageFrameworkEntry'
import { Result, type OkOrError } from '../lib/utilities'
import { InMemoryDirectory } from './InMemoryDirectory'

export abstract class InMemoryFSEntry implements StorageFrameworkEntry {
  protected parent: InMemoryDirectory | null
  private entryName: string

  abstract readonly isDirectory: boolean
  abstract readonly isFile: boolean

  constructor(parent: InMemoryDirectory | null, name: string) {
    this.parent = parent
    this.entryName = this.parent == null ? '' : name
  }

  public get fullPath(): string {
    if (this.parent === null) return '/'
    if (this.isDirectory) return this.parent.fullPath + this.name + '/'
    else return this.parent.fullPath + this.name
  }

  public get isRoot(): boolean {
    return this.parent == null && this.isDirectory
  }

  public get name(): string {
    return this.entryName
  }

  protected isNodeAttachedToRoot(): boolean {
    if (this.isRoot) return true

    if (!this.parent.isNodeAttachedToRoot()) return false

    return this.parent.getChildByName(this.name) === this
  }

  protected verifyNodeIsAttachedToRoot(): SFError | null {
    if (this.isNodeAttachedToRoot()) return null
    return new SFError(
      'this node is not attached to the root entry: ' + this.fullPath
    )
  }

  public getParent(): Result<StorageFrameworkDirectoryEntry | null, SFError> {
    return new Result((resolve) => resolve(this.parent))
  }

  public rename(name: string): OkOrError<SFError> {
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
        this.entryName = name
        resolve()
      }
    })
  }

  public remove(): OkOrError<SFError> {
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

      if(this.isRoot) {
        reject(new SFError("can't remove the root node"))
        return
      }

      this.parent.removeChild(this)
      resolve()
    })
  }

  public moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
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
      // verify that directory is also an InMemoryDirectory
      if (!(directory instanceof InMemoryDirectory)) {
        reject(
          new SFError(
            "not implemented: can't move node to a different filesystem type"
          )
        )
        return
      }
      
      // TODO: verify directory belongs to the same file system instance

      // try moving the node
      directory
        .appendChild(this)
        .then((_) => {
          this.parent.removeChild(this)
          resolve()
        })
        .catch((e) => reject(e))
    })
  }
}
