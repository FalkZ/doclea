import { State, type StateReturns, States } from './State'
import type { SM } from './StateMachineTest'

export class Open extends State<SM, never> {
  protected run(states: States<SM>): State<any, any> {
    return states.end
  }
}
