import {
  StateMachine,
  type UnwrapStateMachine,
  type State,
  StateReturns,
  States,
  DefinableStates,
  DefinableStates2,
  StateMachineDef,
  S
} from './State'

import { Open } from './Open'

export interface SM extends StateMachineDef {
  authenticate: S<this, never>
  open: S<this, never>
}

const s: SM = {
  init: ({ authenticate }) => {
    // wait for button
    return authenticate
  },
  error: ({ init }, arg: Error) => {
    // show message
    return init
  },
  authenticate: ({ open, error }) => {
    if (Math.random() > 0.2) return error.arg(new Error('d '))

    return open
  },
  open: new Open()
}

const test = new StateMachine(s)

test.run()
