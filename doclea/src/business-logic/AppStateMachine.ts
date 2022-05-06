import { StateMachineDefinition, State } from './state-machine/State'
import { StateMachine } from './state-machine/StateMachine'

import { Open } from './Open'

export interface AppStateMachine extends StateMachineDefinition {
  editing: State<this, string>
  selectingStorage: State<this>
}
const app = new StateMachine<AppStateMachine>({
  init: ({ selectingStorage }) => {
    // wait for button
    return selectingStorage
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
  selectingStorage: new selectingStorage(),
  editing: new Open()
})

test.run()
