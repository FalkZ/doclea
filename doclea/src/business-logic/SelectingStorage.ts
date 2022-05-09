import {
  State,
  States,
  type NextState,
  type StateMachineDefinition
} from './state-machine/State'

import { AbstractState } from './state-machine/AbstractState'
import type { AppStateMachine } from './AppStateMachine'
import {
  LocalFileSystem,
  SolidFileSystem,
  GithubFileSystem
} from 'storage-framework'
import { StateMachine } from './state-machine/StateMachine'
import type { none, StorageFrameworkEntry } from 'storage-framework'
import type { StorageFrameworkProvider } from 'storage-framework'
import { Editing } from './Editing'
import { writable, type Readable, type Writable } from 'svelte/store'

interface SelectingStorageStateMachine extends StateMachineDefinition {
  authenticate: State<this>
  open: State<this, StorageFrameworkProvider>
}

enum SelectingStorageEventType {
  Github,
  Solid,
  Local
}

export type SelectingStorageEvent =
  | {
      type: SelectingStorageEventType.Github | SelectingStorageEventType.Solid
      url: string
    }
  | {
      type: SelectingStorageEventType.Local
    }

export class SelectingStorage extends AbstractState<
  AppStateMachine,
  SelectingStorageEvent
> {
  private endState;
  constructor(endState: AbstractState<AppStateMachine, SelectingStorageEvent>) {
    super()
    this.endState = endState
  }
  private async runSelectingStorageStateMachine() {
    const parentState = this
    let fs: StorageFrameworkProvider
    let rootEntry: StorageFrameworkEntry // todo move to global store? editing state needs access to rootdir
    const selectingStorageStateMachine =
      new StateMachine<SelectingStorageStateMachine>({
        init: ({ authenticate }) => {
          console.log('SelectingStorageStatemachine: Init state')
          return authenticate
        },
        error: ({ init }, arg: Error) => {
          console.error('an error occurred', arg)
          return init
        },
        open: async ({ end, error }) => {
          if (fs) {
            // TODO: set url hash
            try {
              rootEntry = await fs.open()
              return end
            } catch (err) {
              return error
            }
          } else return error
        },
        authenticate: async ({ open, error }) => {
          // TODO: activate open buttons
          const event = await parentState.onNextEvent()
          switch (event.type) {
            case SelectingStorageEventType.Github:
              try {
                fs = new GithubFileSystem()
                //(<GithubFileSystem>fs).isLoggedIn
                //await (<GithubFileSystem>fs).authenticate()
                return open
              } catch (err) {
                return error
              }
            case SelectingStorageEventType.Solid:
              try {
                fs = new SolidFileSystem()
                //await fs.authenticate()
                return open
              } catch (err) {
                return error
              }
            case SelectingStorageEventType.Local:
              try {
                fs = new LocalFileSystem()
                return open
              } catch (err) {
                return error
              }
          }
        }
      })

    await selectingStorageStateMachine.run()
  }

  /**
   * Sets url hash to e.g. #https://github.com/...
   */
  private setUrlHash() {}

  protected async run(states: States<AppStateMachine>): Promise<NextState> {
    await this.runSelectingStorageStateMachine()
    return this.endState
  }

  private readonly openButtonStateStore: Writable<boolean> =
    writable()

  get openButtonState(): Readable<boolean> {
    return { subscribe: this.openButtonStateStore.subscribe}
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
