import type { Result, OkOrError } from './utilities/result'
import type { SFError } from './SFError'
import type { Readable as Observable } from './utilities/stores'
import { StorageFrameworkFileEntry } from './StorageFrameworkFileEntry'

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
