import { States, NextState, OneOf } from './State'

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
