import { States, type NextState } from './state-machine/State'
import { AbstractState } from './state-machine/AbstractState'
import type { TestMachine } from './StateMachineTest'
import type { AppStateMachine } from './AppStateMachine'

export class Open extends AbstractState<AppStateMachine> {
  protected run(states: States<AppStateMachine>): Promise<NextState> {
    return new Promise((resolve) => states.end)
  }
}
