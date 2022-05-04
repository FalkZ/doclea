import { AbstractState, States, type NextState } from './State'
import type { TestMachine } from './StateMachineTest'

export class Open extends AbstractState<TestMachine> {
  protected run(states: States<TestMachine>): NextState {
    return states.end
  }
}
