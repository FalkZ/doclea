import { StateMachineDefinition, State } from './state-machine/State'
import { StateMachine } from './state-machine/StateMachine'

import { Editing } from './Editing'
import { SelectingStorage } from './SelectingStorage'

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
  selectingStorage: new SelectingStorage(),
  editing: new Editing()
})

app.run()
