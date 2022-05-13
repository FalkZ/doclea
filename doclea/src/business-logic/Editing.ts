import type { States, NextState } from './state-machine/State'
import { AbstractState } from './state-machine/AbstractState'

import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkFileEntry,
  StorageFrameworkEntry,
} from 'storage-framework'
import { type Readable, type Writable, writable } from 'svelte/store'
import type { AppStateMachine } from './Controller'

enum EditorEventType {
  CloseEditor,
}

export type EditorEvent = EditorEventType.CloseEditor

/**
 * TODO: jsdoc: all public methods
 */
export class Editing extends AbstractState<
  AppStateMachine,
  EditorEvent,
  StorageFrameworkEntry
> {
  protected async run(
    { selectingStorage }: States<AppStateMachine>,
    rootEntry: StorageFrameworkEntry
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

  get selectedFile(): Readable<StorageFrameworkFileEntry | null> {
    return { subscribe: this.selectedFileStore.subscribe }
  }

  get selectedEntry(): Readable<StorageFrameworkFileEntry | null> {
    return { subscribe: this.selectedEntryStore.subscribe }
  }

  get files(): Readable<StorageFrameworkDirectoryEntry | null> {
    return { subscribe: this.filesStore.subscribe }
  }

  public setSelectedEntry(entry: StorageFrameworkEntry): void {
    if (entry.isFile) this.selectedFileStore.set(entry)

    this.selectedEntryStore.set(entry)
  }

  closeEditor(): void {
    this.dispatchEvent(EditorEventType.CloseEditor)
  }
}
