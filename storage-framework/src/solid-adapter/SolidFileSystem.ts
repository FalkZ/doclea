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
  saveSolidDatasetAt,
  createSolidDataset,
  setThing,
  getThing,
  getStringNoLocale,
  getUrlAll,
  getThingAll,
  createThing,
  addStringNoLocale,
  addUrl,
  WithServerResourceInfo,
  SolidDataset,
  Thing
} from '@inrupt/solid-client'

import { FOAF, VCARD, RDF, SCHEMA_INRUPT } from '@inrupt/vocab-common-rdf'
import { Result } from '../lib/utilities'
import { SolidDirectoryEntry } from './SolidDirectoryEntry'

export type SolidSubject = Thing

export class SolidFileSystem implements StorageFrameworkProvider {
  readonly urlPod: string = 'https://pod.inrupt.com/pm4'
  /*   readonly isDirectory: true
  readonly isFile: false
  readonly fullPath: string
  readonly name: string
  private directory: FileSystemDirectoryEntry
  private parent: SolidFileSystem

  constructor(directory: FileSystemDirectoryEntry) {
    this.directory = directory
    this.name = directory.name
    this.fullPath = directory.fullPath
    this.isDirectory = true
    this.isFile = false
    this.directory.getParent((parent) => {
      this.parent = new SolidFileSystem(<FileSystemDirectoryEntry>parent)
    })
  } */

  //TODO fetch subdirectories
  open(): Result<StorageFrameworkEntry, SFError> {
    return new Result((resolve, reject) => {
      this.loginAndFetch()
        .then((subjects) => resolve(new SolidDirectoryEntry(subjects)))
        .catch((e) => reject(new SFError('Failed to ...', e)))
    })
  }

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

    //console.log(dataset)

    const all = Object.keys(dataset.graphs.default)
      .map((graph) =>
        getSolidDataset(graph, {
          fetch: fetch
        })
      )
      .map((values) => values.then((v) => getThingAll(v)))

    const data = await Promise.all(all)
    const dataFlatten = data.flat()

    return dataFlatten
  }

  async getDataStructure() {
    if (getDefaultSession().info.isLoggedIn) {
      const myDataset = await getSolidDataset(this.urlPod, {
        fetch: fetch
      })
      console.log(myDataset)

      const profile = getThing(
        myDataset,
        'https://pod.inrupt.com/pm4/profile#card'
      )

      console.log(profile)
    }
  }

  //TODO save file to solid pod
  async saveDataset() {
    await handleIncomingRedirect()

    if (!getDefaultSession().info.isLoggedIn) {
      await login({
        oidcIssuer: 'https://broker.pod.inrupt.com',
        redirectUrl: window.location.href,
        clientName: 'Doclea'
      })
    }
    let courseSolidDataset = createSolidDataset()

    let newBookThing2 = createThing({ name: 'book2' })
    newBookThing2 = addStringNoLocale(
      newBookThing2,
      SCHEMA_INRUPT.name,
      'ZYX987 of Example Poetry'
    )
    newBookThing2 = addUrl(newBookThing2, RDF.type, 'https://schema.org/Book')
    courseSolidDataset = setThing(courseSolidDataset, newBookThing2)

    const savedSolidDataset = await saveSolidDatasetAt(
      'https://pod.inrupt.com/pm4/bookmarks',
      courseSolidDataset,
      { fetch: fetch }
    )
    console.log(savedSolidDataset)
  }
}
