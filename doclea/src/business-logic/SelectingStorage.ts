import { States, type NextState } from './state-machine/State'
import { AbstractState } from './state-machine/AbstractState'
import type { AppStateMachine } from './AppStateMachine'
import { GithubFileSystem } from 'storage-framework/src'

export class SelectingStorage extends AbstractState<AppStateMachine> {
  protected async run(states: States<AppStateMachine>): NextState {

    await selectingStorageStateMachine.run()

    return states.editing
  }

  public openLocal(): void {
    //todo
  }

  public openSolid(url: string): void {
    //todo
  }

  public openGithub(url: string): void {
    //todo
  }
}

const selectingStorageStateMachine = new StateMachine<AppStateMachine>({
  init: ({ selectingStorage }) => {
    // wait for button
    return authenticate
  },
  error: ({ init }, arg: Error) => {
    console.error('an error occurred', arg)
    return init
  },
  authenticate: async ({ open, error }, string) => {

    if(string == "github") {
      try {
        let fs = new GithubFileSystem()
        return selectingStorageStateMachine.editing
      } catch(err) {
        return selectingStorageStateMachine.error
      }
    }

    return open
  },
})