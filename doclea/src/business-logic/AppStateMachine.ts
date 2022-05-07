import { StateMachineDefinition, State } from './state-machine/State'
import { StateMachine } from './state-machine/StateMachine'

import { Editing } from './Editing'
//import { SelectingStorage } from './SelectingStorage'

export interface AppStateMachine extends StateMachineDefinition {
  editing: State<this, string>
  //selectingStorage: State<this>
}

const appStateMachine = new StateMachine<AppStateMachine>({
  init: ({ editing }) => {
    // wait for button
    return editing
  },
  error: ({ init }, arg: Error) => {
    console.error('an error occurred', arg)
    return init
  },
  //selectingStorage: new SelectingStorage(),
  editing: new Editing()
})

appStateMachine.run()

