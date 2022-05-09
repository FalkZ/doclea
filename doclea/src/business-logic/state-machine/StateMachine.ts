import { Readable, Writable, writable } from 'svelte/store'
import { Logger } from '../Logger'
import { StateMachineDefinition, States, FunctionalState, OneOf } from './State'

export class StateMachine<T extends StateMachineDefinition> {
  private readonly _states: States<T>

  private statesObservable: Writable<OneOf<States<T>>>

  get states(): Readable<OneOf<States<T>>> {
    return {
      subscribe: (cb) => this.statesObservable.subscribe(cb)
    }
  }

  private readonly logger = new Logger()
  constructor(states: T) {
    const e = Object.entries({ ...states, end: () => {} }).map(
      ([key, value]) => {
        if (typeof value === 'function') value = new FunctionalState(value)

        value.setName(key)
        return [key, value]
      }
    )

    this._states = Object.fromEntries(e)
    this.statesObservable = writable(this._states.init)
  }

  async run(): Promise<void> {
    let state: OneOf<States<T>> = this._states.init

    while (state) {
      this.logger.group(state.name)
      this.statesObservable.set(state)
      try {
        const promise = state.runWithArgs(this._states)
        state = await Promise.resolve(promise)
      } catch (e) {
        state = this._states.error.arg(e)
      }
      this.logger.groupEnd()
    }
  }
}
