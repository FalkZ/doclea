import type { Node } from 'unist'
import { visit } from 'unist-util-visit'

export const createTLDrawDiv = (contents: string) => ({
  type: 'tldraw',
  value: contents,
})

const visitCodeBlock = (ast: Node) =>
  visit(ast, 'image', (node, index, parent) => {
    const { url } = node

    if (!url.startsWith('data:image/svg+xml;base64,')) {
      return node
    }

    const newNode = createTLDrawDiv(url)

    if (parent && index != null) {
      parent.children.splice(index, 1, newNode)
    }

    return node
  })

export const remarkTldraw = () => {
  function transformer(tree: Node) {
    visitCodeBlock(tree)
  }

  return transformer
}
