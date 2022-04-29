<script lang="ts">
  import Editor from './views/Editor.svelte'
  import Open from './views/Open.svelte'
  import Theming from './Theming.svelte'
  import Router from './components/Router.svelte'
  import demoContent from './demo.md'

  import type {
    StorageFrameworkDirectoryEntry,
    StorageFrameworkFileEntry,
    StorageFrameworkEntry
  } from 'storage-framework/src/lib/StorageFrameworkEntry'

  import FileTree from './components/filetree/FileTree.svelte'
  import FileSystemPicker from './components/fs-picker/FileSystemPicker.svelte'
  import type { SelectedEventDetail } from './components/filetree/SelectedEventDetail'

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
<Router editorState={{ showEditor: true, openFile: false }}>
  <Open slot="openFile" />
  <main slot="showEditor">
    {#if !rootEntry}
      <div id="sidepane">
        <FileSystemPicker bind:pickedFSEntry={rootEntry} />
      </div>
    {/if}
    {#if rootEntry}
      <div id="filetree">
        <FileTree
          entry={rootEntry}
          on:selected={onEntrySelected}
        />
      </div>
    {/if}
    {#key content}
      <div>
        <Editor defaultValue={content} {selectedFile} />
        <!-- <div bind:this={tldraw} /> -->
      </div>
    {/key}
  </main>
</Router>

<style>
  main {
    display: grid;
    grid-template-columns: minmax(150px, 300px) minmax(0, 1fr);
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
  #sidepane {
    top: 0;
    height: 100vh;
  }
</style>
