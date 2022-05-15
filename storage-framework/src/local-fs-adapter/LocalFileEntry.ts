import { SFError } from '../lib/SFError'
import { SFFile } from '../lib/SFFile'
import type { StorageFrameworkDirectoryEntry } from '../lib/StorageFrameworkEntry'
import { StorageFrameworkFileEntry } from '../lib/StorageFrameworkFileEntry'
import { downloadFile } from '../lib/utilities/downloadFile'
import { Result, type OkOrError } from '../lib/utilities/result'
import type { LocalDirectoryEntry } from './LocalDirectoryEntry'

export class LocalFileEntry implements StorageFrameworkFileEntry {
  readonly isDirectory: false = false
  readonly isFile: true = true
  public wasModified: boolean = false
  readonly fullPath: string
  readonly name: string
  readonly lastModified: number
  private readonly parent: LocalDirectoryEntry
  private readonly fileHandle: FileSystemFileHandle
  private file: File

  public isReadonly: false = false

  constructor(fileHandle: FileSystemFileHandle, parent: LocalDirectoryEntry) {
    this.fileHandle = fileHandle
    this.name = fileHandle.name
    this.parent = parent
  }

  update(file: File | string): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      if (typeof file === 'string') {
        this.file = new SFFile(this.name, this.lastModified, [file])
        this.wasModified = true
      } else if (file instanceof File) {
        this.file = file
        this.wasModified = true
        resolve()
      } else {
        reject(new SFError('file must be instanceof File or typeof string'))
      }
    })
  }

  read(): Result<SFFile, SFError> {
    return new Result(async (resolve, reject) => {
      try {
        this.file = new SFFile(this.name, this.lastModified, [
          this.file || (await this.fileHandle.getFile())
        ])
        resolve(this.file)
      } catch (err) {
        reject(new SFError(`Failed to read local file ${this.fullPath}.`, err))
      }
    })
  }

  save(): OkOrError<SFError> {
    return new Result(async (resolve, reject) => {
      if (!this.file) {
        console.warn('you should first update the file before you write it')
        resolve()
      } else {
        try {
          const writable = await this.fileHandle.createWritable()
          await writable.write(this.file)
          await writable.close()
          this.wasModified = false
          resolve()
        } catch (err) {
          reject(
            new SFError(`Failed to write local file ${this.fullPath}.`, err)
          )
        }
      }
    })
  }

  download(): OkOrError<SFError> {
    return new Result(async (resolve, reject) => {
      try {
        downloadFile(this.file || (await this.read()))
        resolve()
      } catch (error) {
        reject(new SFError('failed to download file', error))
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

  /**
   * TODO: implement
   * @param directory
   */
  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  /**
   * TODO: implement
   * @param name
   */
  rename(name: string): OkOrError<SFError> {
    this.wasModified = true
    throw new Error('Method not implemented.')
  }

  remove(): OkOrError<SFError> {
    return this.parent.removeEntry(this.name)
  }
}
