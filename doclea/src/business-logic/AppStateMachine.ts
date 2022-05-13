import { StateMachineDefinition, State } from './state-machine/State'
import { StateMachine } from './state-machine/StateMachine'

import { Editing } from './Editing'
import {
  SelectingStorage,
  type SelectingStorageEvent
} from './SelectingStorage'
import { writable, type Writable } from 'svelte/store'
import type { Message } from './MessageTypes'
import type { StorageFrameworkEntry } from 'storage-framework'

export interface AppStateMachine extends StateMachineDefinition {
  editing: State<this, StorageFrameworkEntry>
  selectingStorage: State<this, never, SelectingStorageEvent>
}

/**
 * Every action that is taken in the editor should be defined and executed here (except for internal actions of the milkdown editor)
 * All the editor state is stored in this class
 */
export class Controller {
  private readonly messageTimeMs = 2000

  private readonly messageStore: Writable<Message[]> = writable([])
  public appStateMachine = new StateMachine<AppStateMachine>({
    init: ({ selectingStorage }) => {
      // wait for button
      return selectingStorage
    },
    error: ({ init }, arg: Error) => {
      console.error('an error occurred', arg)
      return init
    },
    editing: new Editing(),
    selectingStorage: new SelectingStorage()
  })

  constructor() {
    this.appStateMachine.run()
  }

  /**
   * Messages that get displayed as a banner for the user
   */
  get messages(): Readable<Message[]> {}

  /**
   * Adds message to messageStore and removes it after messageTimeMs
   */
  public showMessage(message: Message) {}

  public toggleDarkMode(): void {}
}
