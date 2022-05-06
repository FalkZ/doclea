import {
  State,
  States,
  type NextState,
  type StateMachineDefinition
} from './state-machine/State'

import { AbstractState } from './state-machine/AbstractState'
import type { AppStateMachine } from './AppStateMachine'
import { GithubFileSystem } from 'storage-framework/src'
import { StateMachine } from './state-machine/StateMachine'
import type { StorageFrameworkProvider } from 'storage-framework/src/lib/StorageFrameworkEntry'

interface SelectingStorageStateMachine extends StateMachineDefinition {
  authenticate: State<this>
  open: State<this, StorageFrameworkProvider>
}

enum SelectingStorageEventType {
  Github,
  Solid,
  Local
}

type SelectingStorageEvent =
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
  private async runSelectingStorageStateMachine() {
    const parentState = this
    const selectingStorageStateMachine =
      new StateMachine<SelectingStorageStateMachine>({
        init: ({ authenticate }) => {
          // wait for button
          return authenticate
        },
        error: ({ init }, arg: Error) => {
          console.error('an error occurred', arg)
          return init
        },
        open: ({ error }, storageFrameworkProvider) => {
          return error
        },
        authenticate: async ({ open, error }, string) => {
          const event = await parentState.onNextEvent()
          switch (event.type) {
            case SelectingStorageEventType.Github:
              const fs = new GithubFileSystem()
              await fs.authenticate()

              return open
          }

          return error
        }
      })

    await selectingStorageStateMachine.run()
  }
  protected async run(states: States<AppStateMachine>): NextState {
    await this.runSelectingStorageStateMachine()
    return states.editing
  }

  public openLocal(): void {
    this.dispatchEvent({ type: SelectingStorageEventType.Local })
  }

  public openSolid(url: string): void {
    //todo
  }

  public openGithub(url: string): void {
    //todo
  }
}
