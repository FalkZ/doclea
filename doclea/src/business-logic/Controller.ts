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
 * Defines the two states SelectingStorage and Editing
 */
export interface AppStateMachine extends StateMachineDefinition {

  /**
   * Editing State init
   */
  editing: State<this, StorageFrameworkEntry>
  /**
   * SelectingStorage State init
   */
  selectingStorage: State<this, never, SelectingStorageEvent>
}

/**
 * Every action that is taken in the editor should be defined and executed here (except for internal actions of the milkdown editor)
 * All the editor state is stored in this class
 * 
 * TODO: use Logger class for all states
 */
export class Controller {
  private readonly messageTimeMs = 2000
  private readonly logger = new Logger()
  private readonly messageStore: Writable<Message[]> = writable([])

  /**
   * Implementation of appStateMachine
   */
  public appStateMachine = new StateMachine<AppStateMachine>({
    
    /**
     * Is entry point for appStateMachine
     * @returns {StateMachine} Returns state selectingStorage
     */
    init: ({ selectingStorage }) => {
      // wait for button
      return selectingStorage
    },
    /**
     * Is triggered every time an error occures
     * @returns {StateMachine} Returns to entry point state init
     */
    error: ({ init }, arg: Error) => {
      this.logger.error('an error occurred', arg)
      return init
    },
    /**
    * Is triggered when appStateMachine moves to Editing state (after successfully selecting storage)
    * @returns {StateMachine} Returns class Editing
    */
    editing: new Editing(),
    /**
    * Is triggered after init
    * @returns {StateMachine} Returns class SelectingStorage
    */
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

  /**
   * Toogles mode to dark mode if it is not already set
   */
  public toggleDarkMode(): void {}
}
