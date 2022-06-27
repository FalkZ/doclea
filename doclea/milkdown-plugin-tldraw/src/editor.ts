import * as React from 'react'
import { Tldraw, TldrawApp, TDDocument, TDExportTypes } from '@tldraw/tldraw'
import ReactDOM from 'react-dom'
import { getDocumentFromImageUri } from './getDocumentFromImageUri'

import { dataURLtoFile, serializeDocument, toImageURL } from './convertions'

const placeholder = `<svg viewBox="-400 -300 800 600">
</svg>`
const prefersDarkMode = Boolean(
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
)

const Component = ({ resolveApi, tdDocument }) => {
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

export class TldrawView {
  private reactDiv: HTMLElement
  private api: TldrawApp

  private renderTLDrawToElement(mountPoint: HTMLElement): Promise<TldrawApp> {
    this.reactDiv = document.createElement('div')

    mountPoint.appendChild(this.reactDiv)

    let resolveApi: (api: TldrawApp) => void

    const api = new Promise<TldrawApp>((res) => {
      resolveApi = (api) => res(api)
    })
    ReactDOM.render(
      React.createElement(
        Component,
        { resolveApi, currentPageId: 'page1' },
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

    this.api = await this.renderTLDrawToElement(mountPoint)

    mountPoint.querySelector('#TD-Zoom').style.marginRight = '20px'

    if (prefersDarkMode) this.api.toggleDarkMode()

    // @ts-expect-error

    if (!document) this.api.addMediaFromFile(dataURLtoFile(src, 'input.svg'))
    else this.api.loadDocument(document)
  }

  async destroy() {
    // export svg
    this.api.selectAll()
    let svg: string = await this.api
      .getSvg()
      .then((s) =>
        s.outerHTML.replace('style="background-color: rgb(255, 255, 255);"', '')
      )
      .catch(() => placeholder)

    // add serialized document
    svg = svg.replace(
      '<svg ',
      `<?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns="http://www.w3.org/2000/svg" data-tldraw="${serializeDocument(
        this.api.document
      )}" `
    )

    console.log(svg)

    const src = toImageURL(svg)

    this.destroyTLDraw()
    this.allowEventBubble()
    console.log(src)

    return src
  }
}
