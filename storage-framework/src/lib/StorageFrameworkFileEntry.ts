import type { SFFile } from './SFFile'
import type { StorageFrameworkEntry } from './StorageFrameworkEntry'
import type { Result, OkOrError } from './utilities/result'
import type { SFError } from './SFError'
import type { Readable as Observable } from './utilities/stores'

/**
 * Representation of a file entry in the storage framework
 *
 * Reading and writing is done as a whole, read() returns the whole file and save() saves the whole file
 */
export interface StorageFrameworkReadonlyFileEntry
  extends StorageFrameworkEntry {
  readonly isDirectory: false
  readonly isFile: true
  readonly isReadonly: true
  /**
   * flag if file was renamed or changed and not yet saved
   */
  readonly wasModified: boolean
  /**
   * Read the whole file and return the data
   * @returns the data, or SFError on error
   */
  read(): Result<SFFile, SFError>

  /**
   * Updates the file entry
   * @returns nothing if succeeded, SFError otherwise
   */
  update(file: File | string): OkOrError<SFError>

  /**
   * Download the file
   * @returns nothing if succeeded, SFError otherwise
   */
  download(): OkOrError<SFError>
}

export interface StorageFrameworkWriteableFileEntry
  extends Omit<StorageFrameworkReadonlyFileEntry, 'isReadonly'> {
  readonly isReadonly: false

  /**
   * Saves the file to the file system
   * @returns nothing if succeeded, SFError otherwise
   */
  save(): OkOrError<SFError>
}

export type StorageFrameworkFileEntry = StorageFrameworkWriteableFileEntry

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
