class TldrawImage extends HTMLImageElement {
  constructor(url: string) {
    super()

    this.setUrl(url)
  }

  hide() {
    this.style.display = 'none'
  }
  show() {
    this.style.display = 'inherit'
  }

  setUrl(url: string) {
    this.setAttribute('src', url)
  }
}

customElements.define('tldraw-image', TldrawImage, { extends: 'img' })

// @ts-ignore
const element: typeof TldrawImage = customElements.get('tldraw-image')

export { element as TldrawImage }
