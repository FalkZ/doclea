import { SFError } from '@lib/SFError'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkFileEntry,
  StorageFrameworkEntry,
} from '@lib/StorageFrameworkEntry'
import { Result } from '@lib/utilities'
import type { OkOrError } from '@lib/utilities'
import { LocalFileEntry } from './LocalFileEntry'

export default class LocalDirectoryEntry
  implements StorageFrameworkDirectoryEntry
{
  isDirectory: true
  isFile: false
  directory: FileSystemDirectoryEntry
  fullPath: string
  name: string
  private filesystem: FileSystem

  constructor(directory: FileSystemDirectoryEntry) {
    this.directory = directory
    this.filesystem = directory.filesystem
    this.filesystem.root
    this.name = directory.name
    this.fullPath = directory.fullPath
    this.isDirectory = true
    this.isFile = false
  }

  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result((resolve, reject) => {
      const reader = this.directory.createReader()
      let entries: FileSystemEntry[] = []

      reader.readEntries(
        (results) => {
          console.log('Reading results... ', results)
          entries = results
          resolve(
            entries.map((entry) => {
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
      let thatDir = this.directory
      this.directory.getFile(
        name,
        { create: true },
        function (file) {
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
        function (folder) {
          resolve(new LocalDirectoryEntry(<FileSystemDirectoryEntry>folder))
        },
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
      this.directory.getParent(
        (parent) => {
          resolve(new LocalDirectoryEntry(<FileSystemDirectoryEntry>parent))
        },
        (err) =>
          reject(
            new SFError(`Parent directory of ${this.fullPath} not found`, err)
          )
      )
    })
  }

  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    return new Result((resolve, reject) => resolve())
  }

  rename(name: string): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.directory.moveTo(
        this.getParent(),
        name,
        (dir) => resolve(),
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
