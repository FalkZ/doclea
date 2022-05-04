import { Logger } from './Logger'

type OneOf<T> = T[keyof T]

type MaybePromise<T> = T | Promise<T>
type Apply<T> = <A>(
  actions: T,
  arg?: A
) => MaybePromise<OneOf<T>> | EndState['end']

export abstract class State<T extends DefinableStates, A> {
  protected abstract run(states: States<T>, arg?: A): StateReturns<T>
  private _name: string
  private _arg: A

  public get name(): string {
    return this._name
  }

  public runWithArgs(states: States<T>): StateReturns<T> {
    const r = this.run(states, this._arg)

    this._arg = null
    return r
  }

  public arg(arg: A): this {
    this._arg = arg
    return this
  }

  public setName(name: string): void {
    this._name = name
  }
}

type Functional<Self extends DefinableStates, Args> = (
  states: States<Self>,
  arg?: Args
) => State<any, any>

export class FuntionalState<T extends DefinableStates, A> extends State<T, A> {
  private readonly fn: Functional<T>

  constructor(fn: Functional<T>) {
    super()
    this.fn = fn
  }

  protected run(states: States<T>, arg?: A): StateReturns<T> {
    return this.fn(states, arg)
  }
}

interface EndState {
  end: () => void
}

export interface DefinableStates {
  [state: string]: Functional<this> | State<this, any>
}

export type S<Self, Args> = Functional<Self, Args> | State<Self, Args>

export interface StateMachineDef {
  init: S<this, never>
  error: S<this, Error>
}

export interface DefinableStates2 {
  [state: string]: <A>(states: this, arg?: A) => StateReturns<any>
}

type Simp<T extends DefinableStates, A> = (
  states: T,
  arg?: A
) => StateReturns<T>

type ConvertFunctional<S> = S extends Simp<infer T, infer A> ? State<T, A> : S

export type States<T extends DefinableStates> = {
  [Property in keyof T]: ConvertFunctional<T[Property]>
} & {
  end: State<T, never>
}

export type StateReturns<T extends DefinableStates> =
  | MaybePromise<OneOf<States<T>>>
  | EndState['end']

export type States2<T extends DefinableStates2> = {
  [Property in keyof T]: ConvertFunctional<T[Property]>
}

export type StateReturns2<T extends DefinableStates2> = MaybePromise<
  OneOf<States2<T>>
>

export class StateMachine<T extends StateMachineDef> {
  /**
   *
   * @param states first state is the init state
   */
  private readonly states: States<T>

  private readonly logger = new Logger()
  constructor(states: T) {
    const e = Object.entries({ ...states, end: () => {} }).map(
      ([key, value]) => {
        if (typeof value === 'function') value = new FuntionalState(value)

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
      const promise =
        typeof state === 'function'
          ? state(this.states)
          : state.runWithArgs(this.states)
      state = await Promise.resolve(promise)
      this.logger.groupEnd()
    }
  }
}

type StateMachineDefinition<T extends DefinableStates> = StateMachine<T>

export type UnwrapStateMachine<T extends StateMachineDefinition<any>> =
  T extends StateMachineDefinition<infer F> ? F : never
