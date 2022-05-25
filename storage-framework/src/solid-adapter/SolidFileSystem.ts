import { SFError } from '../lib/SFError'
import type {
  StorageFrameworkEntry,
  StorageFrameworkProvider
} from '../lib/StorageFrameworkEntry'

import {
  handleIncomingRedirect,
  login,
  fetch,
  getDefaultSession
} from '@inrupt/solid-client-authn-browser'

import { getSolidDataset, getThingAll, type Thing } from '@inrupt/solid-client'

import { Result } from '../lib/utilities/result'
import { SolidDirectoryEntry } from './SolidDirectoryEntry'
import { ReactivityDirDecorator } from '../lib/wrappers/ReactivityDecorator'
import type { Subject } from '@inrupt/solid-client/dist/rdf.internal'

export type SolidSubject = Thing

/**
 * Contains all methods for SolidFileSystem
 */
export class SolidFileSystem implements StorageFrameworkProvider {
  private isSignedIn: boolean
  private sessionId: string

  /**
   * Opens solid entry
   * @param {string} urlPod
   * @returns {StorageFrameworkEntry} on success
   * @returns {SFError} on error
   */
  open(urlPod: string): Result<StorageFrameworkEntry, SFError> {
    return new Result((resolve, reject) => {
      this.fetch(urlPod)
        .then((root) =>
          resolve(
            new ReactivityDirDecorator(
              null,
              new SolidDirectoryEntry(root.url, null)
            )
          )
        )
        .catch((e) => reject(new SFError('Failed to ...', e)))
    })
  }

  /**
   * Fetches root directory from solid pod
   * @param urlPod url of pod
   * @returns Subject
   */
  async fetch(urlPod: string): Promise<Subject> {
    if (!this.sessionId) {
      await this.authenticate()
    }

    const dataset = await getSolidDataset(urlPod, {
      fetch: fetch
    })

    const all = Object.keys(dataset.graphs.default)
      .map((graph) =>
        getSolidDataset(graph, {
          fetch: fetch
        })
      )
      .map((values) => values.then((v) => getThingAll(v)))

    const data = await Promise.all(all)
    const dataFlatten = data.flat()

    return dataFlatten[0]
  }

  /**
   * Runs authentication process of solid
   */
  async authenticate(): Promise<void> {
    await handleIncomingRedirect({
      restorePreviousSession: true
    })

    if (!getDefaultSession().info.isLoggedIn) {
      await login({
        redirectUrl: window.location.href,
        oidcIssuer: 'https://broker.pod.inrupt.com',
        clientName: 'Doclea'
      })
    }
  }
}
