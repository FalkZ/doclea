type OneOf<T> = T[keyof T]

type MaybePromise<T> = T | Promise<T>
type Apply<T> = (actions: T) => MaybePromise<OneOf<T>> | EndState['end']

export interface State<T extends DefinableStates> {
  run(states: States<T>): StateReturns<T>
}

interface EndState {
  end: () => void
}

export interface DefinableStates {
  init: Apply<this & EndState> | State<this>
  [state: string]: Apply<this & EndState> | State<this>
}

export type States<T extends DefinableStates> = T & EndState

export type StateReturns<T extends DefinableStates> =
  | MaybePromise<OneOf<States<T>>>
  | EndState['end']

export class StateMachine<T extends DefinableStates> {
  /**
   *
   * @param states first state is the init state
   */
  private readonly states: States<T>
  constructor(states: T) {
    this.states = { ...states, end: () => {} }
  }

  async run(): Promise<void> {
    let state: OneOf<States<T>> = this.states.init
    while (state) {
      const promise =
        typeof state === 'function'
          ? state(this.states)
          : state.run(this.states)
      state = await Promise.resolve(promise)
      console.log(state.name)
    }
  }
}

type StateMachineDefinition<T extends DefinableStates> = StateMachine<T>

export type UnwrapStateMachine<T extends StateMachineDefinition<any>> =
  T extends StateMachineDefinition<infer F> ? F : never
