<script lang="ts">
  import {
    Editor,
    rootCtx,
    defaultValueCtx,
    editorViewCtx,
    parserCtx,
  } from '@milkdown/core'

  import { clipboard } from '@milkdown/plugin-clipboard'
  import { cursor } from '@milkdown/plugin-cursor'
  import { diagram } from '@milkdown/plugin-diagram'

  import { emoji } from '@milkdown/plugin-emoji'
  import { history } from '@milkdown/plugin-history'
  import { indent } from '@milkdown/plugin-indent'
  import { math } from '@milkdown/plugin-math'
  import { menu } from '@milkdown/plugin-menu'
  import { defaultConfig } from '@milkdown/plugin-menu/src/default-config'
  import { prism } from '@milkdown/plugin-prism'
  import { slash } from '@milkdown/plugin-slash'
  import { tooltip } from '@milkdown/plugin-tooltip'
  import { upload } from '@milkdown/plugin-upload'
  import { gfm } from '@milkdown/preset-gfm/src'
  import { nord } from '@milkdown/theme-nord'

  import { listener, listenerCtx } from '@milkdown/plugin-listener'

  import { tldraw } from 'milkdown-plugin-tldraw'
  import type { StorageFrameworkFileEntry } from 'storage-framework/src/lib/StorageFrameworkEntry'
  import { Slice } from '@milkdown/prose'
  import materialFontUrl from 'material-icons/iconfont/material-icons.css?url'
  import { ActionType, dispatchAction } from '@src/business-logic/actions'
  import { createEventDispatcher } from 'svelte'

  export let selectedFile: StorageFrameworkFileEntry

  const dispatch = createEventDispatcher()

  let output

  const buttons = selectedFile.isReadonly
    ? [
        {
          type: 'button',
          icon: 'download',
          key: '',
        },
      ]
    : [
        {
          type: 'button',
          icon: 'save',
          key: '',
        },
        {
          type: 'button',
          icon: 'download',
          key: '',
        },
      ]

  const defaultMenuConfig = [...defaultConfig]

  defaultMenuConfig.splice(2, 1)

  const menuConfig = [
    buttons,
    ...defaultMenuConfig,
    [
      {
        type: 'button',
        icon: 'draw',
        key: 'InsertTLDraw',
      },
    ],
  ]

  const updateEditorValue = async (selectedFile, ctx) => {
    console.log({ selectedFile, ctx })
    if (ctx === null) return
    const defaultValue = await (await selectedFile.read()).text()

    const view = ctx.get(editorViewCtx)
    const parser = ctx.get(parserCtx)
    const doc = parser(defaultValue)
    if (!doc) return
    const state = view.state
    view.dispatch(
      state.tr.replace(0, state.doc.content.size, new Slice(doc.content, 0, 0))
    )
  }
  let milkdownContext = null

  $: updateEditorValue(selectedFile, milkdownContext)

  const editor = (dom) => {
    Editor.make()
      .config(async (ctx) => {
        milkdownContext = ctx
        ctx.set(rootCtx, dom)

        const defaultValue = await (await selectedFile.read()).text()

        ctx.set(defaultValueCtx, defaultValue)

        ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
          output = markdown
          selectedFile.updateContent(markdown)
        })
      })
      .use(nord)
      .use(gfm)
      .use(tldraw)
      .use(listener)
      .use(clipboard)
      .use(history)
      .use(cursor)
      .use(prism)
      .use(diagram)
      .use(tooltip)
      .use(math)
      .use(emoji)
      .use(indent)
      .use(upload)
      .use(slash)
      .use(
        menu({
          config: menuConfig,
        })
      )
      .create()
      .then(() => {
        if (!selectedFile.isReadonly)
          document.querySelector('[title="save"]').onclick = () => {
            dispatch('action', {
              type: ActionType.Save,
            })
          }

        document.querySelector('[title="download"]').onclick = () => {
          console.log('start download')
          selectedFile.downloadEntry()
        }
      })
  }
</script>

<svelte:head>
  <link href={materialFontUrl} rel="stylesheet" />
</svelte:head>

<div use:editor on:action />

<style>
  :global(.milkdown-menu) {
    max-width: 100%;
  }
  :global(.milkdown) {
    height: calc(100vh - 50px);
    overflow: scroll;
  }
</style>
