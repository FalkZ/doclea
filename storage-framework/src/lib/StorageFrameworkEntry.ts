import type { Result, OkOrError } from './utilities/result'
import type { SFError } from './SFError'
import type { SFFile } from './SFFile'
import { Readable as Observable } from './utilities/stores'

export interface StorageFrameworkProvider {
  // todo: empty?
  open(): Result<StorageFrameworkEntry, SFError>
}

/**
 * Do not implement. Implement {@link StorageFrameworkFileEntry} and {@link StorageFrameworkDirectoryEntry} instead
 */
export interface StorageFrameworkEntry {
  // todo: mabye path class
  // todo: last modified
  readonly fullPath: string
  readonly isDirectory: boolean
  readonly isFile: boolean
  readonly name: string
  getParent(): Result<StorageFrameworkDirectoryEntry | null, SFError>
  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError>
  rename(name: string): OkOrError<SFError>
  /**
   * Remove shall not be recursive
   */
  remove(): OkOrError<SFError>
}

export interface StorageFrameworkFileEntry extends StorageFrameworkEntry {
  readonly isDirectory: false
  readonly isFile: true
  read(): Result<SFFile, SFError>
  watchContent(): Result<Observable<SFFile>, SFError>
  save(file: File): OkOrError<SFError>
}

export interface StorageFrameworkDirectoryEntry extends StorageFrameworkEntry {
  readonly isDirectory: true
  readonly isFile: false
  readonly isRoot: boolean
  getChildren(): Result<StorageFrameworkEntry[], SFError>
  watchChildren(): Result<Observable<StorageFrameworkEntry[]>, SFError>
  createFile(name: string): Result<StorageFrameworkFileEntry, SFError>
  createDirectory(name: string): Result<StorageFrameworkDirectoryEntry, SFError>
}
