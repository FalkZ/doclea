import { SFError } from '../lib/SFError'
import { SFFile } from '../lib/SFFile'
import {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkFileEntry
} from '../lib/StorageFrameworkEntry'
import { Result, OkOrError } from '../lib/utilities'

export class LocalFileEntry implements StorageFrameworkFileEntry {
  isDirectory: false
  isFile: true
  fullPath: string
  name: string
  lastModified: number
  private fileHandle: FileSystemFileHandle

  constructor(fileHandle: FileSystemFileHandle) {
    this.fileHandle = fileHandle
    this.name = fileHandle.name
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
