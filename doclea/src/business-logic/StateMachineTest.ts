import { StateMachine, StateMachineDefinition, State } from './State'

import { Open } from './Open'

export interface TestMachine extends StateMachineDefinition {
  authenticate: State<this>
  open: State<this>
}

const test = new StateMachine<TestMachine>({
  init: ({ authenticate }) => {
    // wait for button
    return authenticate
  },
  error: ({ init }, arg: Error) => {
    console.error('an error occurred', arg)
    return init
  },
  authenticate: async ({ open, error }) => {
    if (Math.random() > 0.2) throw new Error('dsflj')
    // return error.arg(new Error('d '))

    return open
  },
  open: new Open()
})

test.run()
