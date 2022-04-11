import { createCmd, createCmdKey } from '@milkdown/core'
import { setBlockType, textblockTypeInputRule } from '@milkdown/prose'
import { createNode } from '@milkdown/utils'
import { tldrawEditor } from './editor'

import { createInnerEditor } from './inner-editor'

import { TldrawImage } from './tldraw-image'
import { remarkTldraw } from './remark-tldraw'

export type Options = {
  placeholder: {
    empty: string
    error: string
  }
}

// TODO: create CMDKey
// export const TurnIntoDiagram = createCmdKey('TurnIntoDiagram')

export const tldrawNode = createNode<string, Options>((utils, options) => {
  const id = 'tldraw'

  return {
    id,
    schema: () => ({
      content: 'text*',
      group: 'inline',
      inline: true,
      marks: '',
      defining: true,
      atom: true,
      isolating: true,
      attrs: {
        value: {
          default: ''
        },
        identity: {
          default: ''
        }
      },
      parseDOM: [
        {
          tag: `img[data-type="${id}"]`,
          preserveWhitespace: 'full',
          getAttrs: (dom) => {
            if (!(dom instanceof HTMLElement)) {
              throw new Error()
            }
            return {
              value: dom.dataset['url'],
              identity: dom.id
            }
          }
        }
      ],
      toDOM: (node) => {
        const identity = getId(node)
        return [
          'img',
          {
            id: identity,
            class: utils.getClassName(node.attrs, 'tldraw'),
            'data-type': id,
            url: node.attrs['value']
          },
          0
        ]
      },
      parseMarkdown: {
        match: ({ type }) => type === id,
        runner: (state, node, type) => {
          const value = node['value'] as string
          state.openNode(type, { value })
          if (value) {
            state.addText(value)
          }
          state.closeNode()
        }
      },
      toMarkdown: {
        match: (node) => node.type.name === id,
        runner: (state, node) => {
          state.addNode('image', undefined, '', { url: node.value })
        }
      }
    }),
    // TODO: TurnIntoDiagram
    commands: (nodeType) => [
      //  createCmd(TurnIntoDiagram, () => setBlockType(nodeType, { id: getId() })),
    ],
    view: () => (node, view, getPos) => {
      // TODO: remove innerEditor but keep state
      const innerEditor = createInnerEditor()

      let currentNode = node

      const rendered = document.createElement('div')

      rendered.style.position = 'relative'
      rendered.style.width = '100%'
      rendered.style.height = '500px'

      const image = new TldrawImage(node.attrs['value'])
      rendered.appendChild(image)

      rendered.classList.add('tldraw')

      return {
        dom: rendered,
        // TODO: check functionality
        update: (updatedNode) => {
          // const newVal = updatedNode.content.firstChild?.text || ''

          return true
        },
        selectNode: () => {
          innerEditor.openEditor(rendered, currentNode)
          tldrawEditor.create(rendered)
          image.hide()

          rendered.classList.add('ProseMirror-selectednode')
        },
        deselectNode: async () => {
          const src = await tldrawEditor.destroy()
          image.setUrl(src)

          innerEditor.closeEditor()
          rendered.classList.remove('ProseMirror-selectednode')
          image.show()
        },
        // TODO: check functionality
        stopEvent: (event) => {
          const innerView = innerEditor.innerView()
          const { target } = event
          const isChild = target && innerView?.dom.contains(target as Element)

          return !!(innerView && isChild)
        },
        ignoreMutation: () => true,
        destroy() {
          rendered.remove()
        }
      }
    },
    // TODO: maybe create a shortcut
    inputRules: (nodeType) => {
      const inputRegex = /^```mermaid$/
      return [
        //  textblockTypeInputRule(inputRegex, nodeType, () => ({ id: getId() })),
      ]
    },
    remarkPlugins: () => [remarkTldraw]
  }
})
