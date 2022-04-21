import { createCmd, createCmdKey } from '@milkdown/core'
import { setBlockType, textblockTypeInputRule } from '@milkdown/prose'
import { createNode } from '@milkdown/utils'
import { TldrawView } from './editor'
import { tldrawDefaultNode } from './tldraw-default-node'
import { Selection, TextSelection } from '@milkdown/prose'

import { createInnerEditor } from './inner-editor'

import { TldrawImage } from './tldraw-image'
import { remarkTldraw, createTLDrawDiv } from './remark-tldraw'

export type Options = {
  placeholder: {
    empty: string
    error: string
  }
}

export const InsertTLDraw = createCmdKey('InsertTLDraw')

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
          default: '',
        },
        identity: {
          default: '',
        },
        create: {
          default: false,
        },
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
              identity: dom.id,
            }
          },
        },
      ],
      toDOM: (node) => {
        const identity = getId(node)
        return [
          'img',
          {
            id: identity,
            class: utils.getClassName(node.attrs, 'tldraw'),
            'data-type': id,
            url: node.attrs['value'],
          },
          0,
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
        },
      },
      toMarkdown: {
        match: (node) => node.type.name === id,
        runner: (state, node) => {
          state.addNode('image', undefined, '', { url: node.value })
        },
      },
    }),
    // TODO: TurnIntoDiagram
    commands: (nodeType) => [
      createCmd(InsertTLDraw, () => ({ tr, schema }, dispatch) => {
        const node = schema.nodeFromJSON(tldrawDefaultNode())

        const _tr = tr.replaceSelectionWith(node)

        dispatch(_tr)

        return true
      }),
    ],
    view: () => (node, view, getPos) => {
      // TODO: remove innerEditor but keep state
      const innerEditor = createInnerEditor()

      let currentNode = node

      const rendered = document.createElement('div')

      console.log(node.attrs)
      rendered.setAttribute('data-identity', node.attrs['identity'])

      rendered.style.position = 'relative'
      rendered.style.width = '100%'
      rendered.style.height = '500px'

      const image = new TldrawImage(node.attrs['value'])
      rendered.appendChild(image)

      rendered.classList.add('tldraw')

      const tldrawEditor = new TldrawView()

      const r = {
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
        },
      }

      //if (node.attrs.create) r.selectNode()

      return r
    },
    // TODO: maybe create a shortcut
    inputRules: (nodeType) => {
      const inputRegex = /^!!$/
      return [
        textblockTypeInputRule(inputRegex, 'tldraw', () => tldrawDefaultNode),
      ]
    },
    remarkPlugins: () => [remarkTldraw],
  }
})
