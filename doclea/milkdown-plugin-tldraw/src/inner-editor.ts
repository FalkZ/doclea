import { EditorState, EditorView, Node } from '@milkdown/prose'

export const createInnerEditor = () => {
  let innerView: EditorView | undefined

  const openEditor = ($: HTMLElement, doc: Node) => {
    innerView = new EditorView($, {
      state: EditorState.create({
        doc,
        plugins: [],
      }),
      dispatchTransaction: (tr) => {},
    })

    innerView.focus()

    const textEditor: HTMLElement = $.querySelector('.ProseMirror')
    textEditor.style.display = 'none'
  }

  const closeEditor = () => {
    if (innerView) {
      innerView.destroy()
    }
    innerView = undefined
  }

  return {
    openEditor,
    closeEditor,
    innerView: () => innerView,
  }
}
