import type { States, NextState, StateMachineDefinition, State } from './state-machine/State'
import { AbstractState } from './state-machine/AbstractState'
import type { AppStateMachine } from './AppStateMachine'
import { StateMachine } from './state-machine/StateMachine';
import type { StorageFrameworkDirectoryEntry, StorageFrameworkFileEntry } from 'storage-framework';
import { type Readable, type Writable, writable } from 'svelte/store';
import { set_attributes } from 'svelte/internal';

interface EditingStateMachine extends StateMachineDefinition {
  editing: State<this>
}

enum EditorEventType {
  CloseEditor
}

export type EditorEvent = EditorEventType.CloseEditor

export class Editing extends AbstractState<AppStateMachine, EditorEvent> {
  protected async run(states: States<AppStateMachine>): Promise<NextState> {

    await this.runEditingStateMachine()

    return new Promise(resolve => resolve(states.end))
  }
  private async runEditingStateMachine() {
    const parentState = this
    const editingStateMachine = new StateMachine<EditingStateMachine>({
      init: ({ editing }) => {
        // wait for button
        return editing
      },
      error: ({ init }, arg: Error) => {
        console.error('an error occurred', arg)
        return init
      }, 
      editing: async ( { end } ) => {
        const event = await parentState.onNextEvent()

        return end
      }
    })

    await editingStateMachine.run()
  }
  private readonly filesStore: Writable<StorageFrameworkDirectoryEntry> =
    writable()

  private readonly selectedFileStore: Writable<StorageFrameworkFileEntry> =
    writable()

  get selectedFile(): Readable<StorageFrameworkFileEntry> {
    return { subscribe: this.selectedFile.subscribe }
  }

  get files(): Readable<StorageFrameworkDirectoryEntry> {
    return { subscribe: this.filesStore.subscribe }
  }

  public setSelectedFile(file: StorageFrameworkFileEntry): void {
    this.selectedFileStore.set(file)
  }

  public openFileTree(root: StorageFrameworkDirectoryEntry): void {
    //todo
  }

  public closeFileTree(): void {
    //todo
  }

  public saveFile(): void {
    //todo
  }

  public exportFiles(): void {
    //todo
  }

  public toggleDarkMode(): void {
    //todo
  }

  closeEditor(): void {
    this.dispatchEvent(EditorEventType.CloseEditor)
  }
}

