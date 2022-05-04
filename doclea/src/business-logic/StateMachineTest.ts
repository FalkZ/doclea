import { StateMachine, StateMachineDefinition, State } from './State'

import { Open } from './Open'

export interface TestMachine extends StateMachineDefinition {
  authenticate: State<this>
  open: State<this>
}

const s: TestMachine = {
  init: ({ authenticate }) => {
    // wait for button
    return authenticate
  },
  error: ({ init }, arg: Error) => {
    // show message
    return init
  },
  authenticate: async ({ open, error }) => {
    if (Math.random() > 0.2) return error.arg(new Error('d '))

    return open
  },
  open: new Open()
}

const test = new StateMachine(s)

test.run()
