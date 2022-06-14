import type { SFError } from '../SFError'
import type { SFFile } from '../SFFile'
import type { Result } from '../utilities'
import type { WritableDirectoryEntry, WritableFileEntry } from './SFBaseEntry'
import type { Readable as Observable } from '../utilities/stores'
import type { MaybeReadonly } from './CreateReadonly'

/**
 * Add observability to the StorageFrameworkFileEntry
 */
export interface ObservableWritableFileEntry extends WritableFileEntry {
  /**
   * Read the whole file content and watch out for updates
   * @returns an observable for SFFile, or SFError on error
   */
  watchContent(): Result<Observable<SFFile>, SFError>
}

export type ObservableFileEntry = MaybeReadonly<ObservableWritableFileEntry>

/**
 * Add observability to the StorageFrameworkDirectoryEntry
 */
export interface ObservableWritableDirectoryEntry
  extends WritableDirectoryEntry {
  /**
   * retrive all children and watch out for any modifications
   * @returns an observable for children, or SFError on error
   */
  watchChildren(): Result<Observable<ObservableEntry[]>, SFError>
}

export type ObservableDirectoryEntry =
  MaybeReadonly<ObservableWritableDirectoryEntry>

export type ObservableEntry = ObservableDirectoryEntry | ObservableFileEntry
