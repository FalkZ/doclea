import * as React from 'react'
import { Tldraw, TldrawApp, TDDocument, TDExportTypes } from '@tldraw/tldraw'
import ReactDOM from 'react-dom'
import { getDocumentFromImageUri } from './getDocumentFromImageUri'

import { dataURLtoFile, serializeDocument, toImageURL } from './convertions'

const prefersDarkMode = Boolean(
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
)

function Component({ resolveApi, tdDocument }) {
  const rTldrawApp = React.useRef<TldrawApp>()

  const handleMount = React.useCallback((app: TldrawApp) => {
    rTldrawApp.current = app

    resolveApi(app)
  }, [])

  return React.createElement(
    Tldraw,
    {
      document: tdDocument,
      onMount: handleMount,
      onSaveProjectAs: console.log,
      showMenu: false,
      showPages: false
    },
    null
  )
}

class TldrawView {
  private reactDiv: HTMLElement
  private api: TldrawApp

  private renderTLDrawToElement(
    tdDocument: TDDocument,
    mountPoint: HTMLElement
  ): Promise<TldrawApp> {
    this.reactDiv = document.createElement('div')

    mountPoint.appendChild(this.reactDiv)

    let resolveApi: (api: TldrawApp) => void

    const api = new Promise<TldrawApp>((res) => {
      resolveApi = (api) => res(api)
    })
    ReactDOM.render(
      React.createElement(
        Component,
        { resolveApi, tdDocument, currentPageId: 'page1' },
        null
      ),
      this.reactDiv
    )

    return api
  }

  private destroyTLDraw() {
    ReactDOM.unmountComponentAtNode(this.reactDiv)
    this.reactDiv.remove()

    this.reactDiv = null
  }

  private stopPropagation(event) {
    event.stopPropagation()
  }

  private blockElement: HTMLElement
  private blockEventBubble(blockElement: HTMLElement) {
    this.blockElement = blockElement
    this.blockElement.addEventListener('mouseup', this.stopPropagation)
    this.blockElement.addEventListener('mousedown', this.stopPropagation)
    this.blockElement.addEventListener('keydown', this.stopPropagation)
  }

  private allowEventBubble() {
    this.blockElement.removeEventListener('mouseup', this.stopPropagation)
    this.blockElement.removeEventListener('mousedown', this.stopPropagation)
    this.blockElement.removeEventListener('keydown', this.stopPropagation)
  }

  async create(mountPoint: HTMLElement) {
    this.blockEventBubble(mountPoint)

    // get image url
    const src = mountPoint.querySelector('img').getAttribute('src')

    const document = getDocumentFromImageUri(src)

    this.api = await this.renderTLDrawToElement(document, mountPoint)

    mountPoint.querySelector('#TD-Zoom').style.marginRight = '20px'

    if (prefersDarkMode) this.api.toggleDarkMode()

    //@ts-ignore
    if (!document) this.api.addMediaFromFile(dataURLtoFile(src, 'input.svg'))
  }

  async destroy() {
    // export svg
    let svg: string = await new Promise(async (resolve) => {
      // @ts-ignore
      this.api.callbacks.onExport = (all) => {
        resolve(all.serialized)
      }
      await this.api.exportAllShapesAs(TDExportTypes.SVG)
    })

    // add serialized document
    svg = svg.replace(
      '<svg ',
      `<svg data-tldraw="${serializeDocument(this.api.document)}" `
    )

    const src = toImageURL(svg)

    this.destroyTLDraw()
    this.allowEventBubble()

    return src
  }
}

export const tldrawEditor = new TldrawView()