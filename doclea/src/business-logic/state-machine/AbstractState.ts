import type { States, NextState, OneOf } from './State'

export abstract class AbstractState<T, Arg = never, Event = never> {
  protected abstract run(states: States<T>, arg?: Arg): Promise<NextState>
  private _name: string
  private _arg: Arg

  private eventTarget = new EventTarget()

  public get name(): string {
    return this._name
  }

  public runWithArgs(states: States<T>): OneOf<States<T>> {
    const r = this.run(states, this._arg)

    this._arg = null
    return r
  }

  public arg(arg: Arg): this {
    this._arg = arg
    return this
  }

  public setName(name: string): void {
    this._name = name
  }

  private createCustomEvent(event: Event): CustomEvent {
    return new CustomEvent('state', {
      detail: event
    })
  }

  protected onNextEvent(): Promise<Event> {
    return new Promise<Event>((resolve) => {
      const listener: EventListener = ({ detail }) => {
        this.eventTarget.removeEventListener('state', listener)

        resolve(<Event>detail)
      }
      this.eventTarget.addEventListener('state', listener)
    })
  }

  protected dispatchEvent(event: Event) {
    this.eventTarget.dispatchEvent(this.createCustomEvent(event))
  }
}
