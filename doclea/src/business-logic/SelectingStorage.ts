import {
  State,
  States,
  type NextState,
  type StateMachineDefinition
} from './state-machine/State'

import { AbstractState } from './state-machine/AbstractState'
import type { AppStateMachine } from './AppStateMachine'
import { GithubFileSystem, LocalFileSystem, SolidFileSystem } from 'storage-framework/src'
import { StateMachine } from './state-machine/StateMachine'
import type { StorageFrameworkProvider } from 'storage-framework/src/lib/StorageFrameworkEntry'
import type { none } from 'storage-framework'

interface SelectingStorageStateMachine extends StateMachineDefinition {
  authenticate: State<this>
  open: State<this, StorageFrameworkProvider>,
  end: none
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
    let fs 
    let rootDirectory  // todo move to global store? editing state needs access to rootdir
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
        open: async ({ end, error }) => {
          if (fs) {
            try {
              rootDirectory = await fs.open()
              return end
            } catch(err) {
              return error
            }
            
          }
          else return error
        },
        authenticate: async ({ open, error }) => {
          const event = await parentState.onNextEvent()
          switch (event.type) {
            
            case SelectingStorageEventType.Github:
              try {
                fs = new GithubFileSystem()
                await fs.authenticate()
                return open
              } catch(err) {
                return error
              }
              

            case SelectingStorageEventType.Solid:
              try {
                fs = new SolidFileSystem()
                await fs.authenticate()
                return open
              }catch(err) {
                return error
              }
              

            case SelectingStorageEventType.Local:
              try {
                fs = new LocalFileSystem()
                return open
              } catch(err) {
                return error
              }
              
          }
        },
        end: undefined, // which state to return here? state machine needs to stop here 
      })

    await selectingStorageStateMachine.run()
  }
  protected async run(states: States<AppStateMachine>): NextState {
    await this.runSelectingStorageStateMachine()
    return states.editing
  }
}
