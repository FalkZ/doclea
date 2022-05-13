import { States, type NextState } from './state-machine/State'
import { AbstractState } from './state-machine/AbstractState'
import type { TestMachine } from './StateMachineTest'
import type { AppStateMachine } from './AppStateMachine'

export class Open extends AbstractState<TestMachine> {
  protected run(states: States<TestMachine>): Promise<NextState> {
    return new Promise((resolve) => resolve(states.end))
  }
}
