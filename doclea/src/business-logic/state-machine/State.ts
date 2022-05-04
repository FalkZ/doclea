import { AbstractState } from './AbstractState'

export type OneOf<T> = T[keyof T]

type MaybePromise<T> = T | Promise<T>

export type NextState = AbstractState<any, any>

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
