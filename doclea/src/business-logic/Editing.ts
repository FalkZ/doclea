import { States, type NextState } from './state-machine/State'
import { AbstractState } from './state-machine/AbstractState'
import type { AppStateMachine } from './AppStateMachine'
import { StateMachine } from './state-machine/StateMachine';

export class Editing extends AbstractState<AppStateMachine> {
  protected async run(states: States<AppStateMachine>): Promise<NextState> {

    //await editingStateMachine.run();

    return new Promise(resolve => resolve(states.end))
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
    //todo
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
}
/*
const editingStateMachine = new StateMachine<AppStateMachine>({
  init: ({ editing }) => {
    // wait for button
    return editing
  },
  error: ({ init }, arg: Error) => {
    console.error('an error occurred', arg)
    return init
  }
})
*/