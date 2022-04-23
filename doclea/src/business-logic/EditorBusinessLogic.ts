import { writable, type Readable, type Writable } from 'svelte/store'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkFileEntry
} from 'storage-framework/src/lib/StorageFrameworkEntry'

enum MessageType {
  Error = 'error',
  Warning = 'warning',
  Info = 'info'
}

interface Message {
  type: MessageType
  message: string
}

/**
 * Every action that is taken in the editor should be defined and executed here (except for internal actions of the milkdown editor)
 * All the editor state is stored in this class
 */
export class EditorBusinessLogic {
  private readonly messageTimeMs = 2000
  private readonly filesStore: Writable<StorageFrameworkDirectoryEntry> =
    writable()

  private readonly selectedFileStore: Writable<StorageFrameworkFileEntry> =
    writable()

  private readonly messageStore: Writable<Message[]> = writable([])

  get selectedFile(): Readable<StorageFrameworkFileEntry> {
    return { subscribe: this.selectedFile.subscribe }
  }

  get files(): Readable<StorageFrameworkDirectoryEntry> {
    return { subscribe: this.filesStore.subscribe }
  }

  /**
   * Messages that get displayed as a banner for the user
   */
  get messages(): Readable<Message[]> {}

  /**
   * Opens Storage Framework and updates fileStore
   */
  public openGithub(): void {}

  public openLocal(): void {}

  public openSolid(): void {}

  public setSelectedFile(file: StorageFrameworkFileEntry): void {}

  /**
   * Adds message to messageStore and removes it after messageTimeMs
   */
  public showMessage(message: Message) {}
}
