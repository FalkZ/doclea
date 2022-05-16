import type {
  State,
  States,
  NextState,
  StateMachineDefinition
} from './state-machine/State'

import { AbstractState } from './state-machine/AbstractState'
import type { AppStateMachine } from './Controller'
import {
  LocalFileSystem,
  SolidFileSystem,
  GithubFileSystem
} from 'storage-framework'
import { StateMachine } from './state-machine/StateMachine'
import type { StorageFrameworkEntry } from 'storage-framework'
import type { StorageFrameworkProvider } from 'storage-framework'
import { writable, type Readable, type Writable } from 'svelte/store'

/**
 * Defines the two states authenticate and open
 */
interface SelectingStorageStateMachine extends StateMachineDefinition {
  /**
   * authenticate state init
   */
  authenticate: State<this, never, StorageFrameworkProvider>
  /**
   * open state init
   */
  open: State<this, never, StorageFrameworkProvider>
}

enum SelectingStorageEventType {
  Github,
  Solid,
  Local
}

enum ButtonState {
  Active = 1,
  Inactive = 0
}

export type SelectingStorageEvent =
  | {
      type: SelectingStorageEventType.Github | SelectingStorageEventType.Solid
      url: string
    }
  | {
      type: SelectingStorageEventType.Local
    }

/**
 * Contains all methods of the selectingStorage state
 */
export class SelectingStorage extends AbstractState<
  AppStateMachine,
  SelectingStorageEvent
> {
  private rootEntry: StorageFrameworkEntry
  private url: string
  private get fileSystemUrl(): URL | null {
    const url = window.location.hash.replace('#', '')
    return url ? new URL(url) : null
  }

  private async runSelectingStorageStateMachine() {
    const parentState = this
    let fs: StorageFrameworkProvider
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
        error: ({ init, end }, arg: Error) => {
          console.error('an error occurred', arg)
          return init
        },
        /**
         * Is triggered when authenticate has successfully finished
         * @returns {StateMachine} Returns state end (which moves over to editing state)
         */
        open: async ({ end }) => {
          if (this.url) {
            this.rootEntry = await fs.open(this.url)
          } else this.rootEntry = await fs.open()
          return end
        },

        /**
         * Is triggered after init state and handles authentication for the selected storageFramework
         * @returns {StateMachine} Returns state open
         */
        authenticate: async ({ open }) => {
          parentState.openButtonStateStore.set(true)
          if (this.fileSystemUrl) {
            this.url = this.fileSystemUrl.toString()
            switch (this.fileSystemUrl.hostname) {
              case 'github.com':
                fs = new GithubFileSystem(
                  'b0febf46067600eed6e5',
                  '228480a8a7eae9aed8299126211402f47c488013',
                  'mikko-abad',
                  'doclea'
                )
                if (!(<GithubFileSystem>fs).isSignedIn) {
                  await (<GithubFileSystem>fs).authenticate()
                }

                return open
              default:
                fs = new SolidFileSystem()
                if (!fs.isSignedIn) {
                  await fs.authenticate()
                }
                return open
            }
          } else {
            const event = await parentState.onNextEvent()
            switch (event.type) {
              case SelectingStorageEventType.Github:
                fs = new GithubFileSystem()
                this.url = event.url
                this.setUrlHash()
                if (!(<GithubFileSystem>fs).isSignedIn) {
                  await (<GithubFileSystem>fs).authenticate()
                }

                return open

              case SelectingStorageEventType.Solid:
                fs = new SolidFileSystem()
                this.url = event.url
                this.setUrlHash()
                if (!(<SolidFileSystem>fs).isSignedIn) {
                  await (<SolidFileSystem>fs).authenticate()
                }

                return open

              case SelectingStorageEventType.Local:
                fs = new LocalFileSystem()
                return open
            }
          }
        }
      })

    await selectingStorageStateMachine.run()
  }

  /**
   * Sets url hash to e.g. #https://github.com/...
   */
  private setUrlHash() {
    const docURL = new URL(location.href)
    docURL.hash = `#${this.url}`
    location.href = docURL.href
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
   * opens storageFramework of storage-type: local
   */
  public openLocal() {
    this.dispatchEvent({ type: SelectingStorageEventType.Local })
  }

  /**
   * opens storageFramework of storage-type: solid
   */
  public openSolid(url: string): void {
    this.dispatchEvent({ type: SelectingStorageEventType.Solid, url: url })
  }

  /**
   * opens storageFramework of storage-type: github
   */
  public openGithub(url: string): void {
    this.dispatchEvent({ type: SelectingStorageEventType.Github, url: url })
  }
}
