import { StateMachine } from './state-machine/StateMachine'
import { Editing } from './Editing'
import { SelectingStorage } from './SelectingStorage'
import { writable, type Writable } from 'svelte/store'
import type { Message } from './MessageTypes'

import type { StateMachineDefinition, State } from './state-machine/State'

import type { SelectingStorageEvent } from './SelectingStorage'
import type { Readable, StorageFrameworkEntry } from 'storage-framework'
import { Logger } from './Logger'
import { subscribe } from 'svelte/internal'

/**
 * TODO: jsdoc
 */
export interface AppStateMachine extends StateMachineDefinition {
  /**
   * TODO: jsdoc
   */
  editing: State<this, StorageFrameworkEntry>
  /**
   * TODO: jsdoc
   */
  selectingStorage: State<this, never, SelectingStorageEvent>
}

/**
 * Every action that is taken in the editor should be defined and executed here (except for internal actions of the milkdown editor)
 * All the editor state is stored in this class
 * 

 * TODO: jsdoc: all public methods
 * TODO: use Logger class for all states
 */
export class Controller {
  private readonly messageTimeMs = 2000
  private readonly logger = new Logger()

  private readonly messageStore: Writable<Message[]> = writable([])
  public appStateMachine = new StateMachine<AppStateMachine>({
    init: ({ selectingStorage }) => {
      // wait for button
      return selectingStorage
    },
    error: ({ init }, arg: Error) => {
      this.logger.error('an error occurred', arg)
      return init
    },
    editing: new Editing(),
    selectingStorage: new SelectingStorage(),
  })

  constructor() {
    this.appStateMachine.run()
  }

  /**
   * Messages that get displayed as a banner for the user
   */
  get messages(): Readable<Message[]> { 
    return { subscribe: this.messageStore.subscribe }
  }

  /**
   * Adds message to messageStore and removes it after messageTimeMs
   */
  public showMessage(message: Message) {
    this.messageStore.update((messages) => {
      messages.push(message)
      return messages
    })
    setTimeout(() => {
      this.messageStore.update((messages) => {
        messages.shift()
        return messages
      })
    }, this.messageTimeMs);
  }

  public toggleDarkMode(): void {}
}
