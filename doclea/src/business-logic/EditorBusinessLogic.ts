import { writable, type Readable, type Writable } from 'svelte/store'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkFileEntry
} from 'storage-framework/src/lib/StorageFrameworkEntry'

enum MessageType {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Prompt = 'prompt'
}

type Action = () => void

type Label = string

interface MessagePrompt {
  type: MessageType.Prompt
  message: string
  actions: Record<Label, Action>
}

interface BasicMessage {
  type: MessageType.Error | MessageType.Info | MessageType.Warning
  message: string
}

type Message = BasicMessage | MessagePrompt

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
  public openGithub(url: string): void {}

  public openLocal(): void {}

  public openSolid(url: string): void {}

  public setSelectedFile(file: StorageFrameworkFileEntry): void {}

  /**
   * Adds message to messageStore and removes it after messageTimeMs
   */
  public showMessage(message: Message) {}
}
