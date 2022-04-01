import type { SFError } from '@lib/SFError'
import type {
  StorageFrameworkEntry,
  StorageFrameworkProvider,
} from '@lib/StorageFrameworkEntry'

import {
  handleIncomingRedirect,
  login,
  fetch,
  getDefaultSession,
} from 'https://cdn.skypack.dev/@inrupt/solid-client-authn-browser'
import { getSolidDataset, saveSolidDatasetAt } from '@inrupt/solid-client'

export class SolidFileSystem implements StorageFrameworkProvider {
  open(): Result<StorageFrameworkEntry, SFError> {
    loginAndFetch()
    return null
  }
}

async function loginAndFetch() {
  await handleIncomingRedirect()
  console.log('authenticate...')

  if (!getDefaultSession().info.isLoggedIn) {
    await login({
      oidcIssuer: 'https://broker.pod.inrupt.com',
      redirectUrl: window.location.href,
      clientName: 'Doclea',
    })
  }

  /*   const myDataset = await getSolidDataset('https://pod.inrupt.com/pm4', {
    fetch: fetch,
  })
 */

  /*   const savedSolidDataset = await saveSolidDatasetAt(
    'https://pod.inrupt.com/pm4',
    myChangedDataset,
    {
      fetch: fetch,
    }
  ) */
}
