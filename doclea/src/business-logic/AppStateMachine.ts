import { StateMachineDefinition, State } from './state-machine/State'
import { StateMachine } from './state-machine/StateMachine'

import { Editing } from './Editing'
import { SelectingStorage, type SelectingStorageEvent } from './SelectingStorage'

export interface AppStateMachine extends StateMachineDefinition {
  editing: State<this>
  selectingStorage: State<this, SelectingStorageEvent>
}

const appStateMachine = new StateMachine<AppStateMachine>({
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

appStateMachine.run()

