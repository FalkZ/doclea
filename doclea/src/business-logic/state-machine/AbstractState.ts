import { States, NextState, OneOf } from './State'

export abstract class AbstractState<T, E, A = never> {
  protected abstract run(states: States<T>, arg?: A): NextState
  private _name: string
  private _arg: A

  private eventTarget = new EventTarget()

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

  private createCustomEvent(event: E): CustomEvent {
    return new CustomEvent('state', {
      detail: event
    })
  }

  protected onNextEvent(): Promise<E> {
    return new Promise<E>((resolve) => {
      const listener: EventListener = ({ detail }) => {
        this.eventTarget.removeEventListener('state', listener)

        resolve(<E>detail)
      }
      this.eventTarget.addEventListener('state', listener)
    })
  }

  protected dispatchEvent(event: E) {
    this.eventTarget.dispatchEvent(this.createCustomEvent(event))
  }
}
