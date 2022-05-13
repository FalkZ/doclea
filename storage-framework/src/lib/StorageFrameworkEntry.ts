import type { Result, OkOrError } from './utilities/result'
import type { SFError } from './SFError'
import type { SFFile } from './SFFile'
import type { Readable as Observable } from './utilities/stores'

/**
 * Provider for the root entry of a file system.
 *
 * The provider takes care of any authentication implementations.
 */
export interface StorageFrameworkProvider {
  /**
   * Provide the root entry of a file system.
   *
   * @returns the root entry, or an error
   */
  open(url?: string): Result<StorageFrameworkEntry, SFError>
}

/**
 * Common properties for all entries of the storage framework.
 *
 * Do not implement. Implement {@link StorageFrameworkFileEntry} and {@link StorageFrameworkDirectoryEntry} instead
 */
export interface StorageFrameworkEntry {
  // todo: mabye path class
  // todo: last modified
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
   * @returns the parent directory entry or null if this is the root nody, SFError is returned in case of an error
   */
  getParent(): Result<StorageFrameworkDirectoryEntry | null, SFError>
  /**
   * move this entry to given directory, the destination
   *
   * @returns nothing if succeeded, SFError otherwise
   */
  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError>
  /**
   * renames this entry to the given name
   *
   * @returns nothing if succeeded, SFError otherwise
   */
  rename(name: string): OkOrError<SFError>
  /**
   * removes/deletes this entry
   *
   * removing directories is not recursive,
   * the directory must be empty before removing
   *
   * @returns nothing if succeeded, SFError otherwise
   */
  remove(): OkOrError<SFError>
}

/**
 * Representation of a file entry in the storage framework
 *
 * Reading and writing is done as a whole, read() returns the whole file and save() saves the whole file
 */
export interface StorageFrameworkFileEntry extends StorageFrameworkEntry {
  readonly isDirectory: false
  readonly isFile: true
  readonly isReadonly?: true
  /**
   * Read the whole file and return the data
   * @returns the data, or SFError on error
   */
  read(): Result<SFFile, SFError>

  /**
   * Save the whole file
   * @returns nothing if succeeded, SFError otherwise
   */
  save(file: File): OkOrError<SFError>

  /**
   * Download the file
   * @returns nothing if succeeded, SFError otherwise
   */
  //download(): OkOrError<SFError>
}

/**
 * Add observability to the StorageFrameworkFileEntry
 */
export interface ObservableStorageFrameworkFileEntry
  extends StorageFrameworkFileEntry {
  /**
   * Read the whole file content and watch out for updates
   * @returns an observable for SFFile, or SFError on error
   */
  watchContent(): Result<Observable<SFFile>, SFError>
}

/**
 * Representation of a directory in the storage framework
 *
 *
 */
export interface StorageFrameworkDirectoryEntry extends StorageFrameworkEntry {
  readonly isDirectory: true
  readonly isFile: false
  /**
   * true, if this entry is the root entry
   */
  readonly isRoot: boolean
  /**
   * retrieve all children of this directory
   *
   * @returns all children, or SFError
   */
  getChildren(): Result<StorageFrameworkEntry[], SFError>
  /**
   * creates a new file with the given name
   *
   * @returns the created file entry if succeeded, SFError otherwise
   */
  createFile(name: string): Result<StorageFrameworkFileEntry, SFError>
  /**
   * create a new directory with the given name
   *
   * @returns the created directory entry if succeeded, SFError otherwise
   */
  createDirectory(name: string): Result<StorageFrameworkDirectoryEntry, SFError>
}

/**
 * Add observability to the StorageFrameworkDirectoryEntry
 */
export interface ObservableStorageFrameworkDirectoryEntry
  extends StorageFrameworkDirectoryEntry {
  /**
   * retrive all children and watch out for any modifications
   * @returns an observable for children, or SFError on error
   */
  watchChildren(): Result<Observable<StorageFrameworkEntry[]>, SFError>
}
