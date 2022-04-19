<script lang="ts">
  import Editor from './Editor.svelte'
  import demoContent from './demo.md'

  import { onMount } from 'svelte'
  //import { renderTLDrawToElement } from './tldraw/editor'

  import type {
    StorageFrameworkDirectoryEntry,
    StorageFrameworkFileEntry,
  } from 'storage-framework/lib/StorageFrameworkEntry'

  import FileTree from './components/filetree/FileTree.svelte'
  import FileSystemPicker from './components/fs-picker/FileSystemPicker.svelte'
  import type { SelectedEventDetail } from './components/filetree/SelectedEventDetail'

  let content: string = demoContent

  let rootEntry: StorageFrameworkDirectoryEntry | null = null
  const onEntrySelected = (event: CustomEvent<SelectedEventDetail>) => {
    console.log('selected entry: ' + event.detail.entry.fullPath)
    if (event.detail.entry.isFile) {
      let file = <StorageFrameworkFileEntry>event.detail.entry
      file
        .read()
        .then((f) => {
          console.log('opening file: ' + f.name)
          f.text()
            .then((c) => {
              console.log('setting new content: ' + c)
              content = c
            })
            .catch(console.log)
        })
        .catch(console.log)
    }
  }

  let tldraw
  onMount(() => {
    // renderTLDrawToElement(tldraw).then((api) => {
    //   if (prefersDarkMode) api.toggleDarkMode()
    // })
  })
</script>

<main>
  {#if !rootEntry}
    <div id="sidepane">
      <FileSystemPicker bind:pickedFSEntry={rootEntry} />
    </div>
  {/if}
  {#if rootEntry}
    <div id="filetree">
      <FileTree entry={rootEntry} on:selected={onEntrySelected} config={null} />
    </div>
  {/if}
  {#key content}
    <div>
      <Editor defaultValue={content} />
      <!-- <div bind:this={tldraw} /> -->
    </div>
  {/key}
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
    position: sticky;
    top: 0;
    height: 100vh;
  }

  @media (prefers-color-scheme: dark) {
    :global(body) {
      background: #2e3440;
    }
  }
</style>
