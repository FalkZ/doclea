const prefix = 'data:image/svg+xml;base64,'

const tldrawDataAttribute = /data-tldraw=(?:'([^']+)'|"([^"]+)"|([^"' ])+)/

export const getDocumentFromImageUri = (dataURI: string) => {
  if (!dataURI.startsWith(prefix))
    throw new Error(`data uri has wrong prefix: ${dataURI}`)

  const d = dataURI.replace(prefix, '')

  const svg = atob(d)

  const match = tldrawDataAttribute.exec(svg)
  if (!match) return null
  const doc = [...match].slice(1).find((text) => text)

  if (doc) return JSON.parse(atob(doc))
}
