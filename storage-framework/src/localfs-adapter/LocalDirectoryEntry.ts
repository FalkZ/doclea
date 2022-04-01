import { SFError } from '../lib/SFError'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkFileEntry,
  StorageFrameworkEntry,
} from '../lib/StorageFrameworkEntry'
import { Result } from '../lib/utilities'
import type { OkOrError } from '../lib/utilities'
import { LocalFileEntry } from './LocalFileEntry'

export default class LocalDirectoryEntry
  implements StorageFrameworkDirectoryEntry
{
  readonly isDirectory: true
  readonly isFile: false
  readonly fullPath: string
  readonly name: string
  private directory: FileSystemDirectoryEntry
  private parent: LocalDirectoryEntry

  constructor(directory: FileSystemDirectoryEntry) {
    this.directory = directory
    this.name = directory.name
    this.fullPath = directory.fullPath
    this.isDirectory = true
    this.isFile = false
    this.directory.getParent((parent) => {
      this.parent = new LocalDirectoryEntry(<FileSystemDirectoryEntry>parent)
    })
  }

  getDirectoryEntry() {
    return this.directory
  }

  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result((resolve, reject) => {
      const reader = this.directory.createReader()
      reader.readEntries(
        (results) => {
          resolve(
            results.map((entry) => {
              if (entry.isDirectory)
                return new LocalDirectoryEntry(<FileSystemDirectoryEntry>entry)
              else return new LocalFileEntry(<FileSystemFileEntry>entry)
            })
          )
        },
        (error) =>
          reject(
            new SFError(
              `Failed to get directory entries in ${this.fullPath}`,
              error
            )
          )
      )
    })
  }

  createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    return new Result((resolve, reject) => {
      this.directory.getFile(
        name,
        { create: true },
        (file) => {
          let fileEntry = new LocalFileEntry(<FileSystemFileEntry>file)
          resolve(fileEntry)
        },
        (err) =>
          reject(
            new SFError(
              `Failed to create file ${name} in ${this.fullPath}`,
              err
            )
          )
      )
    })
  }

  createDirectory(
    name: string
  ): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      this.directory.getDirectory(
        name,
        { create: true },
        (folder) =>
          resolve(new LocalDirectoryEntry(<FileSystemDirectoryEntry>folder)),
        (err) =>
          reject(
            new SFError(
              `Failed to create directory ${name} in ${this.fullPath}`,
              err
            )
          )
      )
    })
  }

  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      if (this.parent) {
        resolve(this.parent)
      } else {
        reject(
          new SFError(`Failed to get parent of ${this.fullPath}`, new Error())
        )
      }
    })
  }

  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.directory.moveTo(
        (<LocalDirectoryEntry>directory).getDirectoryEntry(),
        this.name,
        () => {
          this.parent = <LocalDirectoryEntry>directory
          resolve()
        },
        (err) =>
          reject(
            new SFError(
              `Failed to move ${this.fullPath} to ${directory.fullPath}`,
              err
            )
          )
      )
    })
  }

  rename(name: string): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.directory.moveTo(
        this.parent,
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
      this.directory.removeRecursively(
        () => resolve(),
        (err) =>
          reject(
            new SFError(`Failed to remove directory ${this.fullPath}`, err)
          )
      )
    })
  }
}
