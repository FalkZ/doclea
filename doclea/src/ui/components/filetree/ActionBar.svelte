<script lang="ts">
  import type {
    StorageFrameworkEntry,
    StorageFrameworkDirectoryEntry,
  } from 'storage-framework/src/lib/StorageFrameworkEntry'

  import logo from '/assets/favicon.svg?raw'
  import FolderPlus from 'tabler-icons-svelte/icons/FolderPlus'
  import FilePlus from 'tabler-icons-svelte/icons/FilePlus'
  import Trash from 'tabler-icons-svelte/icons/Trash'

  export let selectedEntry: StorageFrameworkEntry | null = null

  const canCreate = selectedEntry?.isDirectory
  const canRemove = selectedEntry != null

  const createFolder = () => {
    ;(selectedEntry as StorageFrameworkDirectoryEntry).createDirectory(
      'new folder'
    )
  }

  const createFile = () => {
    ;(selectedEntry as StorageFrameworkDirectoryEntry).createFile('new file')
  }

  const removeEntry = () => {
    selectedEntry?.remove()
  }
</script>

<div id="actionbar">
  <span id="open" disabled={!canCreate}>{@html logo} OPEN</span>
  {#if selectedEntry != null}
    <span
      id="create-file"
      class="right"
      disabled={!canCreate}
      on:click={createFile}><FilePlus /></span
    >
    <span
      id="create-folder"
      class="right"
      disabled={!canCreate}
      on:click={createFolder}><FolderPlus /></span
    >

    <span
      id="remove-entry"
      class="right"
      disabled={!canRemove}
      on:click={removeEntry}><Trash /></span
    >
  {/if}
</div>

<style>
  #actionbar :global(.icon-tabler-folder-plus) {
    position: relative;
    top: 0.25em;
  }

  #actionbar :global(.logo) {
    height: 1.4em;
    width: 1.4em;
    margin: -0.2em;
    position: relative;
    top: 0.1em;
  }
  #actionbar {
    display: block;

    padding: var(--ui-padding-400);
    padding-top: 8px;
  }
  span {
    padding: var(--ui-padding-300);
    cursor: pointer;
    display: inline-block;
    font-weight: bold;
  }
  span:hover {
    background-color: var(--ui-background-500);
  }

  .right {
    float: right;
  }
</style>
