<script lang="ts">
  import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core'
  import { clipboard } from '@milkdown/plugin-clipboard'
  import { cursor } from '@milkdown/plugin-cursor'
  import { diagram } from '@milkdown/plugin-diagram'

  import { emoji } from '@milkdown/plugin-emoji'
  import { history } from '@milkdown/plugin-history'
  import { indent } from '@milkdown/plugin-indent'
  import { listener } from '@milkdown/plugin-listener'
  import { math } from '@milkdown/plugin-math'
  import { menu } from '@milkdown/plugin-menu'
  import { defaultConfig } from '@milkdown/plugin-menu/src/default-config'
  import { prism } from '@milkdown/plugin-prism'
  import { slash } from '@milkdown/plugin-slash'
  import { tooltip } from '@milkdown/plugin-tooltip'
  import { upload } from '@milkdown/plugin-upload'
  import { gfm } from '@milkdown/preset-gfm/src'
  import { nord } from '@milkdown/theme-nord'

  import PrismTheme from './PrismTheme.svelte'

  import { tldraw } from 'milkdown-plugin-tldraw'

  export let defaultValue = '# Hello'

  function editor(dom) {
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, dom)
        ctx.set(defaultValueCtx, defaultValue)
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
  }
</script>


<PrismTheme />


<svelte:head>
  <link
    href="https://fonts.googleapis.com/icon?family=Material+Icons"
    rel="stylesheet"
  />
</svelte:head>

<div use:editor />

<style>
  div {
    position: relative;
    height: 100%;
  }
  :global(.milkdown-menu) {
    position: sticky;
    top: 0;
    z-index: 5;
  }
</style>
