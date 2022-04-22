/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey, ThemeInnerEditorType } from '@milkdown/core'
import { InputRule, NodeSelection, setBlockType } from '@milkdown/prose'
import { createNode } from '@milkdown/utils'

// eslint-disable-next-line import/no-unresolved

import { renderTLDrawToElement } from '../editor'
import { remarkMermaid } from './remark-mermaid'
import { getId } from './utility'
// import { getStyle } from './style'

const inputRegex = '^\\!\\[[^\\]]*\\]\\(data:image\\/svg\\+xml;base64,[^)]*\\)'

export type Options = {
  placeholder: {
    empty: string
    error: string
  }

  themeCSS: string
}

export const TurnIntoDiagram = createCmdKey('TurnIntoDiagram')

export const diagramNode = createNode<string, Options>((utils, options) => {
  // const header = `%%{init: {'theme': 'base', 'themeVariables': { ${mermaidVariables} }}}%%\n`

  // const theme = options?.theme ?? undefined
  // const themeCSS = options?.themeCSS ?? undefined

  const id = 'tldraw'

  const placeholder = {
    empty: 'Empty',
    error: 'Syntax Error',
    ...(options?.placeholder ?? {}),
  }

  return {
    id,
    schema: () => ({
      content: 'text*',
      group: 'block',
      marks: '',
      defining: true,
      atom: true,
      code: true,
      isolating: true,
      attrs: {
        value: {
          default: '',
        },
        identity: {
          default: '',
        },
      },
      parseDOM: [
        {
          tag: `div[data-type="${id}"]`,
          preserveWhitespace: 'full',
          getAttrs: (dom) => {
            if (!(dom instanceof HTMLElement)) {
              throw new Error()
            }
            return {
              //value: dom.dataset['value'],
              identity: dom.id,
            }
          },
        },
      ],
      toDOM: (node) => {
        console.log('toDom', node)
        const identity = getId(node)
        return [
          'div',
          {
            id: identity,
            class: utils.getClassName(node.attrs, 'tldraw'),
            'data-type': id,
            //  'data-value': node.attrs['value'] || node.textContent || '',
          },
          0,
        ]
      },
      parseMarkdown: {
        match: ({ type }) => type === id,
        runner: (state, node, type) => {
          // console.log('got', node)
          const value = node.value as string
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
          state.addNode('image', undefined, null, {
            src: 'https://images.unsplash.com/photo-1646842771025-a4c086556b17?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=707&q=80',
          })
        },
      },
    }),
    commands: (nodeType) => [
      createCmd(TurnIntoDiagram, () => setBlockType(nodeType, { id: getId() })),
    ],
    view: () => (node, view, getPos) => {
      console.log('view', view)
      const currentId = getId(node)
      let currentNode = node
      const renderer = utils.themeTool.get<ThemeInnerEditorType>(
        'inner-editor',
        {
          view,
          getPos,
          render: (code) => {
            renderTLDrawToElement(dom.preview)
          },
        }
      )
      if (!renderer) return {}

      const { onUpdate, editor, dom, onFocus, onBlur, onDestroy, stopEvent } =
        renderer
      editor.dataset['type'] = id
      dom.classList.add('tldraw', 'diagram')

      onUpdate(currentNode, true)

      return {
        dom,
        update: (updatedNode) => {
          if (!updatedNode.sameMarkup(currentNode)) return false
          currentNode = updatedNode
          onUpdate(currentNode, false)

          return true
        },
        selectNode: () => {
          onFocus(currentNode)
        },
        deselectNode: () => {
          onBlur(currentNode)
        },
        stopEvent,
        ignoreMutation: () => true,
        destroy() {
          onDestroy()
        },
      }
    },
    inputRules: (nodeType) => [
      new InputRule(inputRegex, (state, _match, start, end) => {
        const $start = state.doc.resolve(start)
        if (
          !$start
            .node(-1)
            .canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType)
        )
          return null
        const tr = state.tr
          .delete(start, end)
          .setBlockType(start, start, nodeType, { id: getId() })

        return tr.setSelection(NodeSelection.create(tr.doc, start - 1))
      }),
    ],
    remarkPlugins: () => [remarkMermaid],
  }
})
