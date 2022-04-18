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
  private isRoot: boolean
  private children

  constructor(name: string, children: File[], isRoot: boolean) {
    this.name = name
    this.isRoot = isRoot
    this.children = {}
    console.log(children)
    for (let child of children) {
      const path = child.webkitRelativePath.match(/[\w_-]+[\/\\]/g)
      if (path.length === 0) this.fullPath = this.name
      else {
        this.name = path[0].replace(/[\/\\]/, '')
        let current: LocalFallbackDirectoryEntry = this
        for (let dirName of path.slice(1, -2)) {
          dirName = dirName.replace(/[\/\\]/, '')
          if (!current.containsChildDirectory(dirName)) {
            current.addChildDirectory(dirName)
          }
          current = current.getChildDirectory(dirName)
        }
        current.addChildFile(path[path.length - 1].replace(/[\/\\]/, ''), child)
      }
    }
    console.log(this.children)
  }

  addChildFile(name: string, child: File) {
    this.children[name] = new LocalFallbackFileEntry(child, this)
  }

  addChildDirectory(name: string) {
    this.children[name] = new LocalFallbackDirectoryEntry(name, [], false)
  }

  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result((resolve, reject) => {
      resolve(this.children.values)
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
      const newDirectory = new LocalFallbackDirectoryEntry(name, [], false)
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
    throw new Error('Method not implemented.')
  }

  containsChildDirectory(name: string): boolean {
    return (
      this.children.keys().contains(name) && this.children[name].isDirectory
    )
  }

  getChildDirectory(name: string): LocalFallbackDirectoryEntry {
    return this.children[name]
  }
}
