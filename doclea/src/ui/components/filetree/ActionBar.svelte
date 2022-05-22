<script lang="ts">
  import type {
    StorageFrameworkEntry,
    StorageFrameworkDirectoryEntry,
  } from 'storage-framework/src/lib/StorageFrameworkEntry'

  import logo from '/assets/favicon.svg?raw'
  import FolderPlus from 'tabler-icons-svelte/icons/FolderPlus'
  import FilePlus from 'tabler-icons-svelte/icons/FilePlus'
  import Upload from 'tabler-icons-svelte/icons/Upload'
  import Trash from 'tabler-icons-svelte/icons/Trash'
  import { createEventDispatcher, getContext } from 'svelte'
  import type { Readable, Writable } from 'svelte/store'
  import Button from '@ui/components/basic-elements/Button.svelte'

  export let selectedEntry: StorageFrameworkEntry | null = null

  const canCreate = selectedEntry?.isDirectory
  const canRemove = selectedEntry != null
  const dispatch = createEventDispatcher()

  const renameStore: Writable<StorageFrameworkEntry> = getContext('renameStore')

  const createFolder = async () => {
    const entry = await (
      selectedEntry as StorageFrameworkDirectoryEntry
    ).createDirectory('new folder')

    console.log('created entry', entry)
    renameStore.set(entry)
  }

  const createFile = async () => {
    const entry = await (
      selectedEntry as StorageFrameworkDirectoryEntry
    ).createFile('new file')

    console.log('created entry', entry)
    renameStore.set(entry)
  }

  const removeEntry = () => {
    selectedEntry?.remove()
  }
</script>

<div id="actionbar">
  <span
    id="open"
    disabled={!canCreate}
    on:click={(ev) => {
      dispatch('close')
    }}
  >
    {@html logo} OPEN FILES</span
  >
  {#if selectedEntry != null}
    {#if selectedEntry.isDirectory}
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
    {/if}

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
    font-size: 18px;
    height: 1.4em;
    width: 1.4em;
    margin: -0.2em;
    position: relative;
    top: 0.2em;
    margin-left: -0.4em;
    margin-right: 0em;
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

  #open {
    background-color: var(--ui-background-600);
    border-radius: var(--ui-radius-400);
    padding: var(--ui-padding-300) var(--ui-padding-400);
    box-shadow: var(--ui-box-shadow);
  }
</style>
