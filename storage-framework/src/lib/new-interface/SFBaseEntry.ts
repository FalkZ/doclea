import type { Result, OkOrError } from '../utilities/result'
import type { SFError } from '../SFError'
import type { SFFile } from '../SFFile'

/**
 * Common properties for all entries of the storage framework.
 *
 * Do not implement. Implement {@link FileEntry} and {@link DirectoryEntry} instead
 */
export interface BaseEntry {
  /**
   * The full path to the root of the file system
   */
  readonly fullPath: string
  /**
   * true, if entry is a directory
   */
  readonly isDirectory: boolean
  /**
   * true, if entry is a file
   */
  readonly isFile: boolean
  /**
   * the name of the entry
   */
  readonly name: string
  /**
   * retrieve the parent of the this entry.
   *
   * @returns the parent directory entry or null if this is the root node, SFError is returned in case of an error
   */
  getParent(): Result<DirectoryEntry | null, SFError>

  /**
   * removes/deletes this entry
   *
   * removing directories is not recursive,
   * the directory must be empty before removing
   *
   * @returns nothing if succeeded, SFError otherwise
   */
  delete(): OkOrError<SFError>
}

/**
 * Representation of a directory in the storage framework
 */
export interface WritableDirectoryEntry extends BaseEntry {
  readonly isDirectory: true
  readonly isFile: false
  readonly isReadonly: false
  /**
   * true, if this entry is the root entry
   */
  readonly isRoot: boolean
  /**
   * retrieve all children of this directory
   *
   * @returns all children, or SFError
   */
  getChildren(): Result<Entry[], SFError>

  /**
   * creates a new file with the given name
   *
   * @returns the created file entry if succeeded, SFError otherwise
   */
  createFile(file: File): Result<FileEntry, SFError>
  /**
   * create a new directory with the given name
   *
   * @returns the created directory entry if succeeded, SFError otherwise
   */
  createDirectory(name: string): Result<DirectoryEntry, SFError>
}

type ReadonlyDirectoryEntry = Omit<
  WritableDirectoryEntry,
  'delete' | 'createFile' | 'createDirectory' | 'isReadonly'
> & {
  readonly isReadonly: true
}

export type DirectoryEntry = ReadonlyDirectoryEntry | WritableDirectoryEntry

/**
 * Representation of a file entry in the storage framework
 *
 * Reading and writing is done as a whole, read() returns the whole file
 */
export interface WritableFileEntry extends BaseEntry {
  readonly isDirectory: false
  readonly isFile: true
  readonly isReadonly: false

  /**
   * Read the whole file and return the data
   * @returns the data, or SFError on error
   */
  read(): Result<SFFile, SFError>

  /**
   * Saves the file to the file system
   * @returns nothing if succeeded, SFError otherwise
   */
  write(file: File): OkOrError<SFError>
}

export type ReadonlyFileEntry = Omit<
  WritableFileEntry,
  'delete' | 'write' | 'isReadonly'
> & {
  readonly isReadonly: true
}

export type FileEntry = WritableFileEntry | ReadonlyFileEntry

export type Entry = FileEntry | DirectoryEntry
