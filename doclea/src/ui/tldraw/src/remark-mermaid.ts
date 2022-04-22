/* Copyright 2021, Milkdown by Mirone. */

import { Node } from 'unist-util-visit'
import { visit } from 'unist-util-visit'

const createMermaidDiv = (contents: string) => ({
  type: 'tldraw',
  value: contents,
})

const visitCodeBlock = (ast: Node) => {
  return visit(ast, 'image', (node, index, parent) => {
    const { url } = node

    // If this codeblock is not mermaid, bail.
    if (!url.startsWith('data:image/svg+xml;base64,')) {
      console.log('not a ')
      return node
    }

    const newNode = createMermaidDiv(url)

    if (parent && index != null) {
      parent.children.splice(index, 1, newNode)
    }

    return node
  })
}
export const remarkMermaid = () => {
  function transformer(tree: Node) {
    visitCodeBlock(tree)
  }

  return transformer
}
