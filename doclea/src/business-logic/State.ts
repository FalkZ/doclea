import { Logger } from './Logger'

type OneOf<T> = T[keyof T]

type MaybePromise<T> = T | Promise<T>

export type NextState = AbstractState<any, any>

export abstract class AbstractState<T, A = never> {
  protected abstract run(states: States<T>, arg?: A): NextState
  private _name: string
  private _arg: A

  public get name(): string {
    return this._name
  }

  public runWithArgs(states: States<T>): OneOf<States<T>> {
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

type Functional<Self, Args> = (
  states: States<Self>,
  arg?: Args
) => MaybePromise<NextState>

export class FunctionalState<
  T extends DefinableStates,
  A
> extends AbstractState<T, A> {
  private readonly fn: Functional<T, A>

  constructor(fn: Functional<T, A>) {
    super()
    this.fn = fn
  }

  protected run(states: States<T>, arg?: A): NextState {
    return this.fn(states, arg)
  }
}

export interface DefinableStates {
  [state: string]: Functional<this, any> | AbstractState<this, any>
  end: never
}

export type State<Self, Args = never> =
  | Functional<Self, Args>
  | AbstractState<Self, Args>

export interface StateMachineDefinition {
  init: State<this, never>
  error: State<this, Error>
}

type ConvertFunctionalToClass<S> = S extends Functional<infer Self, infer Arg>
  ? AbstractState<Self, Arg>
  : S

export type States<Self> = {
  [Property in keyof Self]: ConvertFunctionalToClass<Self[Property]>
} & {
  end: AbstractState<any, never>
}

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
      const promise =
        typeof state === 'function'
          ? state(this.states)
          : state.runWithArgs(this.states)
      state = await Promise.resolve(promise)
      this.logger.groupEnd()
    }
  }
}
