import { StateMachineDefinition, State } from './state-machine/State'
import { StateMachine } from './state-machine/StateMachine'

import { Editing } from './Editing'
import { SelectingStorage } from './SelectingStorage'

export interface AppStateMachine extends StateMachineDefinition {
  editing: State<this, string>
  //selectingStorage: State<this>
}

export const appStateMachine = new StateMachine<AppStateMachine>({
  init: ({ editing }, arg) => {
    // wait for button
    console.log('AppStateMachine: Init State', arg)
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

