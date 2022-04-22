import { SFError } from '../lib/SFError'
import {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry,
  StorageFrameworkFileEntry
} from '../lib/StorageFrameworkEntry'
import { Result, OkOrError } from '../lib/utilities'
import { LocalFileEntry } from './LocalFileEntry'

export class LocalDirectoryEntry implements StorageFrameworkDirectoryEntry {
  readonly isDirectory: true
  readonly isFile: false
  readonly fullPath: string
  readonly name: string
  readonly isRoot: boolean
  private parent: LocalDirectoryEntry
  private directoryHandle: FileSystemDirectoryHandle

  constructor(
    directoryHandle: FileSystemDirectoryHandle,
    parent: LocalDirectoryEntry,
    isRoot: boolean
  ) {
    this.directoryHandle = directoryHandle
    this.parent = parent
    this.isRoot = isRoot
    this.name = directoryHandle.name
    this.isFile = false
    this.isDirectory = true
    this.fullPath = this.isRoot
      ? '/' + this.name
      : this.parent.fullPath + '/' + this.name
  }

  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result(async (resolve, reject) => {
      let children: StorageFrameworkEntry[] = []
      ;(async () => {
        for await (const [key, value] of this.directoryHandle.entries()) {
          let child: FileSystemHandle = value
          if (child.kind === 'directory') {
            children.push(
              new LocalDirectoryEntry(
                <FileSystemDirectoryHandle>child,
                this,
                false
              )
            )
          } else if (child.kind === 'file') {
            children.push(new LocalFileEntry(<FileSystemFileHandle>child, this))
          }
        }
        resolve(children)
      })()
    })
  }

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

  createDirectory(
    name: string
  ): Result<StorageFrameworkDirectoryEntry, SFError> {
    throw new Error('Method not implemented.')
  }

  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      if (this.parent) resolve(this.parent)
      else
        reject(
          new SFError(`Directory ${this.fullPath} has no parent.`, new Error())
        )
    })
  }

  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  rename(name: string): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  remove(): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      if (this.parent) {
        this.parent.removeEntry(this.name)
        resolve()
      } else {
        const errMsg = `Failed to remove directory ${this.fullPath}`
        reject(new SFError(errMsg, new Error(errMsg)))
      }
    })
  }

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
