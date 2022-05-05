<script lang="ts">
  import Editor from './views/Editor.svelte'
  import Open from './views/Open.svelte'
  import Theming from './Theming.svelte'
  import Router from './components/Router.svelte'
  import demoContent from './demo.md?raw'

  import { Pane, Splitpanes } from 'svelte-splitpanes'

  import type {
    StorageFrameworkDirectoryEntry,
    StorageFrameworkFileEntry,
    StorageFrameworkEntry,
  } from 'storage-framework/src/lib/StorageFrameworkEntry'

  import FileTree from './components/filetree/FileTree.svelte'
  import FileSystemPicker from './components/fs-picker/FileSystemPicker.svelte'
  import type { SelectedEventDetail } from './components/filetree/SelectedEventDetail'
  import Messages from './components/prompt/Messages.svelte'

  let content: string = demoContent

  let selectedFile: StorageFrameworkFileEntry | null = null

  let rootEntry: StorageFrameworkDirectoryEntry | null = null
  const onEntrySelected = (event: CustomEvent<SelectedEventDetail>) => {
    console.log('selected entry: ' + event.detail.entry.fullPath)
    if (event.detail.entry.isFile) {
      const file = <StorageFrameworkFileEntry>event.detail.entry
      selectedFile = file
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
</script>

<Theming />
<Messages />
<Router editorState={{ showEditor: true, openFile: false }}>
  <Open slot="openFile" />
  <main slot="showEditor">
    <Splitpanes class="default-theme" style="height: 100%; width: 100vw">
      <Pane size="20">
        {#if !rootEntry}
          <div id="sidepane">
            <FileSystemPicker bind:pickedFSEntry={rootEntry} />
          </div>
        {/if}
        {#if rootEntry}
          <div id="filetree">
            <FileTree entry={rootEntry} on:selected={onEntrySelected} />
          </div>
        {/if}
      </Pane>
      <Pane>
        {#key content}
          <div>
            <Editor defaultValue={content} {selectedFile} />
            <!-- <div bind:this={tldraw} /> -->
          </div>
        {/key}
      </Pane>
    </Splitpanes>
  </main>
</Router>

<style>
  main {
    display: grid;
    /* grid-template-columns: minmax(150px, 300px) minmax(0, 1fr); */
    height: 100vh;
    width: 100vw;
  }
  :global(.icon-tabler) {
    height: 2em;
    margin-top: -0.5em;
    margin-bottom: -0.5em;
    position: relative;
    top: 0.1em;
  }
  #sidepane,
  #filetree {
    display: block;
    box-sizing: border-box;
    height: 100vh;
    background: var(--ui-background-500);
  }

  :global(html) {
    background-color: var(--ui-background-500) !important;
  }
  :global(.splitpanes) {
    background-color: var(--ui-background-500) !important;
  }
  :global(.splitpanes__splitter) {
    background-color: var(--ui-background-500) !important;
    border-color: var(--ui-background-500) !important;
    color: var(--ui-foreground-400) !important;
  }

  :global(.splitpanes__splitter::before, .splitpanes__splitter::after) {
    background-color: var(--ui-foreground-300) !important;
  }
</style>
