import { resolveObjectURL } from 'buffer'
import { SFError } from '../lib/SFError'
import { SFFile } from '../lib/SFFile'
import {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkFileEntry
} from '../lib/StorageFrameworkEntry'
import { Result, OkOrError } from '../lib/utilities'
import { LocalDirectoryEntry } from './LocalDirectoryEntry'

export class LocalFileEntry implements StorageFrameworkFileEntry {
  readonly isDirectory: false
  readonly isFile: true
  readonly fullPath: string
  readonly name: string
  readonly lastModified: number
  private parent: LocalDirectoryEntry
  private fileHandle: FileSystemFileHandle

  constructor(fileHandle: FileSystemFileHandle, parent: LocalDirectoryEntry) {
    this.fileHandle = fileHandle
    this.name = fileHandle.name
    this.parent = parent
    this.isDirectory = false
    this.isFile = true
  }

  read(): Result<SFFile, SFError> {
    return new Result(async (resolve, reject) => {
      try {
        let file = await this.fileHandle.getFile()
        resolve(new SFFile(this.name, this.lastModified, [file]))
      } catch (err) {
        reject(new SFError(`Failed to read local file ${this.fullPath}.`, err))
      }
    })
  }

  save(file: File): OkOrError<SFError> {
    return new Result(async (resolve, reject) => {
      try {
        const writable = await this.fileHandle.createWritable()
        await writable.write(file)
        await writable.close()
        resolve()
      } catch (err) {
        reject(new SFError(`Failed to write local file ${this.fullPath}.`, err))
      }
    })
  }

  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      if (this.parent) resolve(this.parent)
      else {
        const errMsg = `File ${this.fullPath} has no parent.`
        reject(new SFError(errMsg, new Error(errMsg)))
      }
    })
  }

  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  rename(name: string): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  remove(): OkOrError<SFError> {
    return this.parent.removeEntry(this.name)
  }
}
