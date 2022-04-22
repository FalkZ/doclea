import { SFError } from '../../lib/SFError'
import {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry,
  StorageFrameworkFileEntry
} from '../../lib/StorageFrameworkEntry'
import { Result, OkOrError } from '../../lib/utilities'
import LocalFallbackFileEntry from './LocalFallbackFileEntry'

export default class LocalFallbackDirectoryEntry
  implements StorageFrameworkDirectoryEntry
{
  isDirectory: true
  isFile: false
  fullPath: string
  name: string
  parent: LocalFallbackDirectoryEntry
  private isRoot: boolean
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
    for (let child of children) {
      const path = child.webkitRelativePath.match(/[\w_-]+[\/\\]/g)
      const fileName = child.webkitRelativePath
        .match(/[\/\\][\w\ .,:_-]+/g)
        .pop()
        .replace(/[\/\\]/, '')
      if (path.length === 0) this.fullPath = this.name
      else {
        this.name = path[0].replace(/[\/\\]/, '')
        let current: LocalFallbackDirectoryEntry = this
        for (let dirName of path.slice(1)) {
          dirName = dirName.replace(/[\/\\]/, '')
          if (!current.containsChildDirectory(dirName)) {
            current.addChildDirectory(dirName)
          }
          current = current.getChildDirectory(dirName)
        }
        current.addChildFile(fileName, child)
      }
    }
  }

  addChildFile(name: string, child: File) {
    this.children[name] = new LocalFallbackFileEntry(child, this)
  }

  addChildDirectory(name: string) {
    this.children[name] = new LocalFallbackDirectoryEntry(name, [], false, this)
  }

  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result((resolve, reject) => {
      resolve(Object.values(this.children))
    })
  }

  createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    return new Result((resolve, reject) => {
      const newFile = new LocalFallbackFileEntry(new File([], name), this)
      resolve(newFile)
    })
  }

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
    throw new Error('Method not implemented.')
  }

  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  rename(name: string): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  remove(): OkOrError<SFError> {
    return new Result(async (resolve, reject) => {
      try {
        this.getParent
      } catch (error) {}
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
}
