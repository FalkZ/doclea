import { SFError } from '../lib/SFError'
import {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry,
  StorageFrameworkFileEntry
} from '../lib/StorageFrameworkEntry'
import { Result, OkOrError } from '../lib/utilities'
import { LocalFileEntry } from './LocalFileEntry'

export class LocalDirectoryEntry implements StorageFrameworkDirectoryEntry {
  isDirectory: true
  isFile: false
  fullPath: string
  name: string
  private directoryHandle: FileSystemDirectoryHandle

  constructor(directoryHandle: FileSystemDirectoryHandle) {
    this.directoryHandle = directoryHandle
    this.name = directoryHandle.name
    this.isFile = false
    this.isDirectory = true
  }

  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result(async (resolve, reject) => {
      let children: StorageFrameworkEntry[] = []
      ;(async () => {
        for await (const [key, value] of this.directoryHandle.entries()) {
          let child: FileSystemHandle = value
          if (child.kind === 'directory') {
            children.push(
              new LocalDirectoryEntry(<FileSystemDirectoryHandle>child)
            )
          } else if (child.kind === 'file') {
            children.push(new LocalFileEntry(<FileSystemFileHandle>child))
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
        resolve(new LocalFileEntry(fileHandle))
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
}
