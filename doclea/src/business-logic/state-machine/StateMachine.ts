import { Logger } from '../Logger'
import { StateMachineDefinition, States, FunctionalState, OneOf } from './State'

export class StateMachine<T extends StateMachineDefinition> {
  /**
   *
   * @param states first state is the init state
   */
  private readonly states: States<T>

  private readonly logger = new Logger()
  constructor(states: T) {
    const e = Object.entries({ ...states, end: () => {} }).map(
      ([key, value]) => {
        if (typeof value === 'function') value = new FunctionalState(value)

        value.setName(key)
        return [key, value]
      }
    )

    this.states = Object.fromEntries(e)
  }

  async run(): Promise<void> {
    let state: OneOf<States<T>> = this.states.init

    while (state) {
      this.logger.group(state.name)
      try {
        const promise = state.runWithArgs(this.states)
        state = await Promise.resolve(promise)
      } catch (e) {
        state = this.states.error.arg(e)
      }
      this.logger.groupEnd()
    }
  }
}
