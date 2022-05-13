import type {
  State,
  States,
  NextState,
  StateMachineDefinition,
} from './state-machine/State'

import { AbstractState } from './state-machine/AbstractState'
import type { AppStateMachine } from './Controller'
import {
  LocalFileSystem,
  SolidFileSystem,
  GithubFileSystem,
} from 'storage-framework'
import { StateMachine } from './state-machine/StateMachine'
import type { StorageFrameworkEntry } from 'storage-framework'
import type { StorageFrameworkProvider } from 'storage-framework'
import { writable, type Readable, type Writable } from 'svelte/store'

/**
 * TODO: jsdoc
 */
interface SelectingStorageStateMachine extends StateMachineDefinition {
  /**
   * TODO: jsdoc
   */
  authenticate: State<this>
  /**
   * TODO: jsdoc
   */
  open: State<this, StorageFrameworkProvider>
}

enum SelectingStorageEventType {
  Github,
  Solid,
  Local,
}

enum ButtonState {
  Active = 1,
  Inactive = 0,
}

export type SelectingStorageEvent =
  | {
      type: SelectingStorageEventType.Github | SelectingStorageEventType.Solid
      url: string
    }
  | {
      type: SelectingStorageEventType.Local
    }

/**
 * TODO: jsdoc: all public methods
 */
export class SelectingStorage extends AbstractState<
  AppStateMachine,
  SelectingStorageEvent
> {
  private rootEntry: StorageFrameworkEntry
  private async runSelectingStorageStateMachine() {
    const parentState = this
    let fs: StorageFrameworkProvider
    const selectingStorageStateMachine =
      new StateMachine<SelectingStorageStateMachine>({
        init: ({ authenticate }) => {
          return authenticate
        },
        error: ({ init, end }, arg: Error) => {
          console.error('an error occurred', arg)
          return end
        },
        open: async ({ end, error }) => {
          // TODO: set url hash
          this.rootEntry = await fs.open()
          return end
        },
        authenticate: async ({ open, error }) => {
          //parentState.openButtonStateStore.set(b)
          const event = await parentState.onNextEvent()
          switch (event.type) {
            case SelectingStorageEventType.Github:
                fs = new GithubFileSystem()
                //(<GithubFileSystem>fs).isLoggedIn
                await (<GithubFileSystem>fs).authenticate()
                return open

            case SelectingStorageEventType.Solid:
                fs = new SolidFileSystem()

                await fs.authenticate()
                return open

            case SelectingStorageEventType.Local:
                fs = new LocalFileSystem()
                return open
          }
        },
      })

    await selectingStorageStateMachine.run()
  }

  /**
   * Sets url hash to e.g. #https://github.com/...
   */
  private setUrlHash() {}

  protected async run({
    editing,
  }: States<AppStateMachine>): Promise<NextState> {
    await this.runSelectingStorageStateMachine()

    return editing.arg(this.rootEntry)
  }

  private readonly openButtonStateStore: Writable<ButtonState> = writable(
    ButtonState.Inactive
  )

  get isOpenButtonActive(): Readable<boolean> {
    return { subscribe: this.openButtonStateStore.subscribe }
  }

  public openLocal() {
    this.dispatchEvent({ type: SelectingStorageEventType.Local })
  }

  public openSolid(url: string): void {
    this.dispatchEvent({ type: SelectingStorageEventType.Solid, url: url })
  }

  public openGithub(url: string): void {
    this.dispatchEvent({ type: SelectingStorageEventType.Github, url: url })
  }
}
