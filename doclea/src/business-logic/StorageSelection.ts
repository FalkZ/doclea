import {
  type DefinableStates,
  type StateReturns,
  type States,
  type UnwrapStateMachine
} from './state-machine/State'
import { type AbstractState } from './state-machine/AbstractState'
import { StateMachine } from './state-machine/StateMachine'
import type { BusinessLogicStateMachine } from './BusinessLogic'
import type { businessLogic } from './BusinessLogic'

export class StorageSelectionState
  implements AbstractState<UnwrapStateMachine<typeof businessLogic>>
{
  private async runInnerStateMachine(): Promise<void> {
    return await new Promise((resolve) => {
      new StateMachine({
        init: ({ authenticate }) => {
          // wait for button
          return authenticate
        },
        error: ({ init }) => {
          // show message
          return init
        },
        authenticate: ({ open, error }) => {
          const err = false
          if (err) return error

          return open
        },
        open: ({ end, error }) => {
          const err = false
          if (err) return error

          resolve()
          return end
        }
      })
    })
  }

  async run(
    states: States<BusinessLogicStateMachine>
  ): StateReturns<BusinessLogicStateMachine> {
    await this.runInnerStateMachine()

    return states.end
  }
}
