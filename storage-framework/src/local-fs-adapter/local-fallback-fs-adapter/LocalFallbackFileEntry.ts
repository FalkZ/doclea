import { SFError } from '../../lib/SFError'
import { SFFile } from '../../lib/SFFile'
import type { StorageFrameworkDirectoryEntry } from '../../lib/StorageFrameworkEntry'
import type { StorageFrameworkReadonlyFileEntry } from '../../lib/StorageFrameworkFileEntry'
import { Result, type OkOrError } from '../../lib/utilities'
import { downloadFile } from '../../lib/utilities/downloadFile'
import type { LocalFallbackDirectoryEntry } from './LocalFallbackDirectoryEntry'

export class LocalFallbackFileEntry
  implements StorageFrameworkReadonlyFileEntry
{
  public isReadonly: true = true
  readonly isDirectory: false = false
  public wasModified: boolean = false
  readonly isFile: true
  readonly fullPath: string
  private file: File
  private readonly parent: LocalFallbackDirectoryEntry

  get name(): string {
    return this.file.name
  }

  get lastModified(): number {
    return this.file.lastModified
  }

  constructor(file: File, parent: LocalFallbackDirectoryEntry) {
    this.file = file
    this.fullPath = '/' + file.webkitRelativePath
    this.isDirectory = false
    this.isFile = true
    this.parent = parent
  }

  update(file: File | string): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      if (typeof file === 'string') {
        this.file = new SFFile(this.name, this.lastModified, [file])
        this.wasModified = true
      } else if (file instanceof File) {
        this.file = file
        resolve()
      } else {
        reject(new SFError('file must be instanceof File or typeof string'))
      }
    })
  }

  download(): OkOrError<SFError> {
    return new Result(async (resolve, reject) => {
      try {
        downloadFile(this.file)
        resolve()
      } catch (error) {
        reject(new SFError('failed to download file', error))
      }
    })
  }

  read(): Result<SFFile, SFError> {
    return new Result((resolve, reject) => {
      resolve(this.file)
    })
  }

  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      resolve(this.parent)
    })
  }

  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  rename(name: string): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.file = new SFFile(name, this.lastModified, [this.file])
      this.wasModified = true
      resolve()
    })
  }

  remove(): OkOrError<SFError> {
    return new Result(async (resolve, reject) => {
      try {
        await this.parent.removeChild(this.name)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
}
