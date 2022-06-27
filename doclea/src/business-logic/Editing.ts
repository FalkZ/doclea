import type { States, NextState } from './state-machine/State'
import { AbstractState } from './state-machine/AbstractState'

import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkFileEntry,
  StorageFrameworkEntry
} from 'storage-framework'

import { type Readable, type Writable, writable } from 'svelte/store'
import type { AppStateMachine, Controller } from './Controller'
import { MessageType } from './MessageTypes'
import { ErrorMessage, AddActionListener } from './decorators'
import { ActionHandler, ActionType } from './actions'

enum EditorEventType {
  CloseEditor
}

export type EditorEvent = EditorEventType.CloseEditor

/**
 * Contains all methods of the editing state
 */
export class Editing
  extends AbstractState<AppStateMachine, StorageFrameworkEntry, EditorEvent>
  implements ActionHandler
{
  private readonly controller: Controller

  public constructor(controller: Controller) {
    super()
    this.controller = controller
    console.log(this)
  }

  protected async run(
    { selectingStorage }: States<AppStateMachine>,
    rootEntry: StorageFrameworkDirectoryEntry
  ): Promise<NextState> {
    console.log('added files', rootEntry)
    this.filesStore.set(rootEntry)
    await this.onNextEvent()

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
  public get selectedFile(): Readable<StorageFrameworkFileEntry | null> {
    return { subscribe: this.selectedFileStore.subscribe }
  }

  /**
   * Gets the selected entry by the user
   * @returns {StorageFrameworkFileEntry} Returns selectedEntryStore
   */
  public get selectedEntry(): Readable<StorageFrameworkEntry | null> {
    return { subscribe: this.selectedEntryStore.subscribe }
  }

  /**
   * Gets the files of the selected directory entry by the user
   * @returns {StorageFrameworkDirectoryEntry} Returns filesStore
   */
  public get files(): Readable<StorageFrameworkDirectoryEntry | null> {
    return { subscribe: this.filesStore.subscribe }
  }

  /**
   * Sets the selected entry by the user
   */
  public setSelectedEntry(entry: StorageFrameworkEntry): void {
    if (entry.isFile)
      this.selectedFileStore.set(<StorageFrameworkFileEntry>entry)

    this.selectedEntryStore.set(entry)
  }

  private onError(message: string, error: Error) {
    this.controller.showMessage({ type: MessageType.Error, message })
  }

  private static readonly actionListeners = new Map<ActionType, string>()
  public static addActionListener(action: ActionType, key: string) {
    this.actionListeners.set(action, key)
  }

  public onAction({ detail: { arg, type } }): void {
    const listener = Editing.actionListeners.get(type)
    if (!listener) {
      console.error(
        'no listener added for ActionType',
        Object.keys(ActionType)[type]
      )
    } else {
      console.log(this)
      this[listener](this, arg)
    }
  }

  /**
   * Closes the editor with a dispatch method
   */

  //@ErrorMessage('Failed to open storage selection')
  @AddActionListener(ActionType.OpenStorageSelection)
  public closeEditor(t): void {
    console.log(this, t, arguments)
    window.location.hash = ''
    this.dispatchEvent(EditorEventType.CloseEditor)
  }
}
