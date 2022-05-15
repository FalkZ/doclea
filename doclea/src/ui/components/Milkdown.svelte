<script lang="ts">
  import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core'
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

  export let selectedFile: StorageFrameworkFileEntry

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

  const editor = (dom) => {
    Editor.make()
      .config(async (ctx) => {
        const defaultValue = await (await selectedFile.read()).text()
        ctx.set(rootCtx, dom)

        console.log(defaultValue)
        ctx.set(defaultValueCtx, defaultValue)

        ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
          console.log(markdown)
          selectedFile.update(markdown)
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
          config: [
            buttons,
            ...defaultConfig,
            [
              {
                type: 'button',
                icon: 'draw',
                key: 'InsertTLDraw',
              },
            ],
          ],
        })
      )
      .create()
      .then(() => {
        if (!selectedFile.isReadonly)
          document.querySelector('[title="save"]').onclick = () => {
            console.log('start saving')
            selectedFile.save()
          }

        document.querySelector('[title="download"]').onclick = () => {
          console.log('start download')
          selectedFile.download()
        }
      })
  }
</script>

<svelte:head>
  <link
    href="https://fonts.googleapis.com/icon?family=Material+Icons"
    rel="stylesheet"
  />
</svelte:head>

<div use:editor />

<style>
  :global(.milkdown-menu) {
    max-width: 100%;
  }
  :global(.milkdown) {
    height: calc(100vh - 50px);
    overflow: scroll;
  }
</style>
