import type {
  State,
  States,
  NextState,
  StateMachineDefinition,
  StateError
} from './state-machine/State'

import { AbstractState } from './state-machine/AbstractState'
import type { AppStateMachine, Controller } from './Controller'
import {
  LocalFileSystem,
  SolidFileSystem,
  GithubFileSystem
} from 'storage-framework'
import { StateMachine } from './state-machine/StateMachine'
import type { StorageFrameworkEntry } from 'storage-framework'
import type { StorageFrameworkProvider } from 'storage-framework'
import { writable, type Readable, type Writable } from 'svelte/store'
import MessagesSvelte from '@src/ui/components/prompt/Messages.svelte'
import { MessageType } from './MessageTypes'

/**
 * Defines the two states authenticate and open
 */
interface SelectingStorageStateMachine extends StateMachineDefinition {
  /**
   * authenticate state init
   */
  authenticate: State<this>
  /**
   * open state init
   */
  open: State<this, StorageFrameworkProvider>
}

export interface SelectingStorageEvent {
  url?: string
}

/**
 * Contains all methods of the selectingStorage state
 */
export class SelectingStorage extends AbstractState<
  AppStateMachine,
  never,
  SelectingStorageEvent
> {
  constructor(controller: Controller) {
    super()
    this.controller = controller
  }
  private controller: Controller
  private rootEntry: StorageFrameworkEntry

  private get fileSystemUrl(): string | null {
    const url = window.location.hash.replace('#', '')
    return url || null
  }

  /**
   * Sets url hash to e.g. #https://github.com/...
   */
  private set fileSystemUrl(url: string | null | undefined) {
    if (url) window.location.hash = url
    else window.location.hash = ''
  }

  private getStorageByUrl(url?: string): StorageFrameworkProvider {
    if (!url) {
      return new LocalFileSystem()
    } else if (url.startsWith('https://github.com')) {
      return new GithubFileSystem({
        clientId: 'b0febf46067600eed6e5',
        clientSecret: '228480a8a7eae9aed8299126211402f47c488013'
      })
    } else {
      return new SolidFileSystem()
    }
  }

  private async runSelectingStorageStateMachine() {
    const selectingStorageStateMachine =
      new StateMachine<SelectingStorageStateMachine>({
        /**
         * Is entry point for SelectingStorage
         * @returns {StateMachine} Returns state authenticate
         */
        init: ({ authenticate }) => {
          return authenticate
        },
        /**
         * Is triggered every time an error occures
         * @returns {StateMachine} Returns to entry point state init
         */
        error: ({ init, end }, error: StateError) => {
          console.error(error)
          this.controller.showMessage({
            type: MessageType.Error,
            message: `an error occurred in ${error.lastState}`
          })
          this.fileSystemUrl = null
          return init
        },
        /**
         * Is triggered when authenticate has successfully finished
         * @returns {StateMachine} Returns state end (which moves over to editing state)
         */
        open: async ({ end }, fs) => {
          this.rootEntry = await fs.open(this.fileSystemUrl)

          return end
        },

        /**
         * Is triggered after init state and handles authentication for the selected storageFramework
         * @returns {StateMachine} Returns state open
         */
        authenticate: async ({ open }) => {
          this.openButtonStateStore.set(true)
          if (this.fileSystemUrl) {
            const fs = this.getStorageByUrl(this.fileSystemUrl)

            if (!fs.isSignedIn) {
              await fs.authenticate()
            }

            return open.arg(fs)
          } else {
            const { url } = await this.onNextEvent()

            this.fileSystemUrl = url
            const fs = this.getStorageByUrl(url)

            if (fs.authenticate && !fs.isSignedIn) {
              await fs.authenticate()
            }

            return open.arg(fs)
          }
        }
      })

    await selectingStorageStateMachine.run()
  }

  protected async run({
    editing
  }: States<AppStateMachine>): Promise<NextState> {
    await this.runSelectingStorageStateMachine()
    return editing.arg(this.rootEntry)
  }

  private readonly openButtonStateStore: Writable<boolean> = writable(false)

  /**
   * Gets if the OpenButton is active or not
   * @returns {boolean} Returns if the OpenButton is active or not
   */
  get isOpenButtonActive(): Readable<boolean> {
    return { subscribe: this.openButtonStateStore.subscribe }
  }

  /**
   * opens storageFramework with url or local without url
   */
  public open(url?: string): void {
    this.dispatchEvent({ url: url })
  }
}
