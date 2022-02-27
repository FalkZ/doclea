<script lang="ts">
  import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core'
  import { commonmark } from '@milkdown/preset-commonmark'
  import { nord } from '@milkdown/theme-nord'

  export let defaultValue = '# Hello'

  function editor(dom) {
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, dom)
        ctx.set(defaultValueCtx, defaultValue)
      })
      .use(nord)
      .use(commonmark)
      .create()
  }
</script>

<header><h1>Doclea</h1></header>
<div use:editor />

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  img {
    height: 16rem;
    width: 16rem;
  }

  h1 {
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 100;
    line-height: 1.1;
    margin: 2rem auto;
    max-width: 14rem;
  }

  p {
    max-width: 14rem;
    margin: 1rem auto;
    line-height: 1.35;
  }

  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }

    p {
      max-width: none;
    }
  }
</style>
