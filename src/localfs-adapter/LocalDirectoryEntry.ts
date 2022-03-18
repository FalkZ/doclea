import { SFError } from '@lib/SFError'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkFileEntry,
  StorageFrameworkEntry,
} from '@lib/StorageFrameworkEntry'
import { Result } from '@lib/utitities'
import type { OkOrError } from '@lib/utitities'
import { LocalFileEntry } from './LocalFileEntry'

export default class LocalDirectoryEntry
  implements StorageFrameworkDirectoryEntry
{
  isDirectory: true
  isFile: false
  private directory: FileSystemDirectoryEntry
  fullPath: string
  name: string
  private filesystem: FileSystem

  constructor(directory: FileSystemDirectoryEntry) {
    this.directory = directory
    this.filesystem = directory.filesystem
    this.filesystem.root
    this.getChildren()
  }

  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result((resolve, reject) => {
      const reader = this.directory.createReader()
      const entries: FileSystemEntry[] = []

      const getEntries = () => {
        reader.readEntries(
          (results) => {
            if (results.length) {
              entries.push(...results)
              getEntries()
            }
          },
          (error) =>
            reject(new SFError('Failed to get directory entries', error))
        )
      }

      getEntries()
      resolve(
        entries.map((entry) => {
          console.log('--- ', entry)
          if (entry.isDirectory) return new LocalDirectoryEntry(entry)
          else return new LocalFileEntry(entry, this.directory)
        })
      )
    })
  }

  createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    return new Result((resolve, reject) => {
      this.directory.getFile(
        name,
        { create: true },
        function (file) {
          resolve(new LocalFileEntry(file.fullPath))
        },
        (err) => reject(err)
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
          resolve(new LocalDirectoryEntry(folder))
        },
        (err) => reject(err)
      )
    })
  }

  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      this.directory.getParent(
        (parent) => {
          resolve(new LocalDirectoryEntry(parent))
        },
        (err) => reject(err)
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
    throw new Error('Method not implemented.')
  }
}
