<script lang="ts">
  import type {
    StorageFrameworkDirectoryEntry,
    StorageFrameworkEntry,
  } from 'storage-framework/src/lib/StorageFrameworkEntry'
  import type {
    DeselectionCallback,
    SelectedEventDetail,
  } from './SelectedEventDetail'

  import { createEventDispatcher, setContext } from 'svelte'

  import TreeNode from './TreeNode.svelte'
  import ActionBar from './ActionBar.svelte'
  import { Writable, writable } from 'svelte/store'

  export let entry: StorageFrameworkDirectoryEntry

  const dispatch = createEventDispatcher()

  let selectedEntry: StorageFrameworkEntry | null = null
  let deselectionCallback: DeselectionCallback | null = null

  const onEntrySelected = (event: CustomEvent<SelectedEventDetail>) => {
    if (selectedEntry !== event.detail.entry) {
      if (deselectionCallback) deselectionCallback()
    }

    selectedEntry = event.detail.entry
    deselectionCallback = event.detail.onDeselect
    dispatch('selected', event.detail)
  }

  const renameStore: Writable<StorageFrameworkEntry> = writable(null)

  setContext('renameStore', renameStore)
</script>

<ActionBar {selectedEntry} on:close />

<div class="treewrapper">
  <div id="tree">
    <TreeNode {entry} showAsRootNode={true} on:selected={onEntrySelected} />
  </div>
</div>

<style>
  #tree {
    display: table;
    width: 100%;
  }
  .treewrapper {
    overflow: auto;
    max-width: 100%;
    height: calc(100vh - 50px);
  }
</style>
