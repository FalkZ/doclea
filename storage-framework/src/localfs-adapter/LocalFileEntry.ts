import { SFError } from '@lib/SFError'
import { SFFile } from '@lib/SFFile'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkFileEntry,
} from '@lib/StorageFrameworkEntry'
import { Result, OkOrError } from '@lib/utilities'
import LocalDirectoryEntry from './LocalDirectoryEntry'

export class LocalFileEntry implements StorageFrameworkFileEntry {
  readonly isDirectory: false
  readonly isFile: true
  readonly fullPath: string
  readonly name: string
  private lastModified: number
  private parent: StorageFrameworkDirectoryEntry
  private file: FileSystemFileEntry

  constructor(file: FileSystemFileEntry) {
    this.file = file
    this.fullPath = file.fullPath
    this.name = file.name
    this.isDirectory = false
    this.isFile = true
    this.file.file((file) => (this.lastModified = file.lastModified))
    this.file.getParent((parent) => {
      this.parent = new LocalDirectoryEntry(<FileSystemDirectoryEntry>parent)
    })
  }

  read(): Result<SFFile, SFError> {
    return new Result((resolve, reject) => {
      this.file.file(
        (file) => {
          resolve(new SFFile(this.name, this.lastModified, [file]))
        },
        (err) => reject(new SFError('Failed to read file', err))
      )
    })
  }

  save(file: File): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.file.createWriter(
        (fileWriter) => {
          fileWriter.write(file)
          console.log('Saved file: ', file)
          resolve()
        },
        (err) => reject(new SFError('Failed to save file', err))
      )
    })
  }

  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      if (this.parent) {
        resolve(this.parent)
      }
      else {
        reject(new SFError(`Failed to get parent of ${this.fullPath}`, new Error()))
      }
    })
  }

  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.file.moveTo(
        (<LocalDirectoryEntry>directory).getDirectoryEntry(),
        this.name,
        () => {
          this.parent = directory
          resolve()
        },
        (err) => reject(new SFError('Failed to move file', err))
      )
    })
  }

  rename(name: string): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.file.moveTo(
        this.getParent(),
        name,
        () => resolve(),
        (err) =>
          reject(
            new SFError(`Failed to rename ${this.fullPath} to ${name}`, err)
          )
      )
    })
  }
  remove(): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.file.remove(
        () => resolve(),
        (err) => reject(new SFError(`Failed to remove ${this.fullPath}`, err))
      )
    })
  }
}
