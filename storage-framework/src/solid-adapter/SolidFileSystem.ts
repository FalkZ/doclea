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

import {
  getSolidDataset,
  createSolidDataset,
  getThingAll,
  Thing
} from '@inrupt/solid-client'

import { Result } from '../lib/utilities'
import { SolidDirectoryEntry } from './SolidDirectoryEntry'
import { ReactivityDirDecorator } from 'src/lib/wrappers/ReactivityDecorator'

export type SolidSubject = Thing

export class SolidFileSystem implements StorageFrameworkProvider {
  readonly urlPod: string = 'https://pod.inrupt.com/pm4'

  open(): Result<StorageFrameworkEntry, SFError> {
    return new Result((resolve, reject) => {
      this.loginAndFetch()
        .then((root) => resolve(new ReactivityDirDecorator(null, new SolidDirectoryEntry(root.url, null, null))))
        .catch((e) => reject(new SFError('Failed to ...', e)))
    })
  }

  //TODO only root fetch
  async loginAndFetch() {
    await handleIncomingRedirect()

    if (!getDefaultSession().info.isLoggedIn) {
      await login({
        oidcIssuer: 'https://broker.pod.inrupt.com',
        redirectUrl: window.location.href,
        clientName: 'Doclea'
      })
    }

    const dataset = await getSolidDataset(this.urlPod, {
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

  getFileName(url: string): string {
    return url.match('([^/]+)(?=[^/]*/?$)')[0]
  }
}
