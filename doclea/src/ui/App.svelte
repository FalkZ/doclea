<script lang="ts">
  import Editor from './Editor.svelte'
  import content from 'bundle-text:./demo.md'
  import Button from './Button.svelte'

  import Folder from 'tabler-icons-svelte/icons/Folder.svelte'
  import BrandGithub from 'tabler-icons-svelte/icons/BrandGithub.svelte'
  import Cloud from 'tabler-icons-svelte/icons/Cloud.svelte'
  import { onMount } from 'svelte'
  import { renderTLDrawToElement } from './tldraw/editor'
  import { ColorStyle, TDShapeType } from '@tldraw/tldraw'
  import { prefersDarkMode } from './prefersDarkMode'

  let tldraw
  onMount(() => {
    renderTLDrawToElement(tldraw).then((api) => {
      if (prefersDarkMode) api.toggleDarkMode()
    })
  })
</script>

<main>
  <div id="sidepane">
    <Button><Folder /> Open Local File</Button>
    <Button><BrandGithub /> Open Github Project</Button>
    <Button><Cloud /> Open Solid Folder</Button>
  </div>
  <div>
    <Editor defaultValue={content} />
    <!-- <div bind:this={tldraw} /> -->
  </div>
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  :global(html, body) {
    height: 100%;
    margin: 0;
  }
  main {
    display: grid;
    grid-template-columns: minmax(150px, 300px) 1fr;
    height: 100vh;
  }
  :global(.icon-tabler) {
    height: 2em;
    margin-top: -0.5em;
    margin-bottom: -0.5em;
    position: relative;
    top: 0.1em;
  }
  #sidepane {
    top: 0;
    height: 100vh;
  }

  @media (prefers-color-scheme: dark) {
    :global(body) {
      background: #2e3440;
    }
  }
</style>
