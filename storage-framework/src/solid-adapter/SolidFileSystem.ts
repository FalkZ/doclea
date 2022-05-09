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

import { Result } from '../lib/utilities'
import { SolidDirectoryEntry } from './SolidDirectoryEntry'

export type SolidSubject = Thing

export class SolidFileSystem implements StorageFrameworkProvider {
  isSignedIn: boolean
  sessionId: string

  open(urlPod: string): Result<StorageFrameworkEntry, SFError> {
    return new Result((resolve, reject) => {
      this.loginAndFetch(urlPod)
        .then((root) => resolve(new SolidDirectoryEntry(root.url, null)))
        .catch((e) => reject(new SFError('Failed to ...', e)))
    })
  }

  //TODO only root fetch
  async loginAndFetch(urlPod: string) {
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

  async authenticate() {
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

  getFileName(url: string): string {
    return url.match('([^/]+)(?=[^/]*/?$)')[0]
  }
}
