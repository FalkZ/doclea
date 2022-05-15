import type { States, NextState } from './state-machine/State'
import { AbstractState } from './state-machine/AbstractState'

import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkFileEntry,
  StorageFrameworkEntry,
} from '../../../storage-framework'
import { type Readable, type Writable, writable } from 'svelte/store'
import type { AppStateMachine } from './Controller'

enum EditorEventType {
  CloseEditor,
}

export type EditorEvent = EditorEventType.CloseEditor

/**
 * Contains all methods of the editing state
 */
export class Editing extends AbstractState<
  AppStateMachine,
  EditorEvent,
  StorageFrameworkEntry
> {
  protected async run(
    { selectingStorage }: States<AppStateMachine>,
    rootEntry: StorageFrameworkDirectoryEntry
  ): Promise<NextState> {
    console.log('added files', rootEntry)
    this.filesStore.set(rootEntry)
    const event = await this.onNextEvent()

    return selectingStorage
  }

  private readonly filesStore: Writable<StorageFrameworkDirectoryEntry | null> =
    writable()

  private readonly selectedFileStore: Writable<StorageFrameworkFileEntry | null> =
    writable()

  private readonly selectedEntryStore: Writable<StorageFrameworkEntry | null> =
    writable()

  /**
    * Gets the selected file by the user
    * @returns {StorageFrameworkFileEntry} Returns selectedFileStore
    */
  get selectedFile(): Readable<StorageFrameworkFileEntry | null> {
    return { subscribe: this.selectedFileStore.subscribe }
  }

  /**
    * Gets the selected entry by the user
    * @returns {StorageFrameworkFileEntry} Returns selectedEntryStore
    */
  get selectedEntry(): Readable<StorageFrameworkEntry | null> {
    return { subscribe: this.selectedEntryStore.subscribe }
  }

  /**
    * Gets the files of the selected directory entry by the user
    * @returns {StorageFrameworkDirectoryEntry} Returns filesStore
    */
  get files(): Readable<StorageFrameworkDirectoryEntry | null> {
    return { subscribe: this.filesStore.subscribe }
  }

  /**
    * Sets the selected entry by the user
    */
  public setSelectedEntry(entry: StorageFrameworkEntry): void {
    if (entry.isFile) this.selectedFileStore.set(<StorageFrameworkFileEntry>entry)

    this.selectedEntryStore.set(entry)
  }

  /**
    * Closes the editor with a dispach method
    */
  closeEditor(): void {
    this.dispatchEvent(EditorEventType.CloseEditor)
  }
}
