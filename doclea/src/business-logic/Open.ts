import { States, type NextState } from './state-machine/State'
import { AbstractState } from './state-machine/AbstractState'
import type { TestMachine } from './StateMachineTest'

export class Open extends AbstractState<TestMachine> {
  protected run(states: States<TestMachine>): NextState {
    return states.end
  }
}
