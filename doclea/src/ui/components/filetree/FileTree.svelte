<script lang="ts">
  import type { StorageFrameworkDirectoryEntry, StorageFrameworkEntry } from 'storage-framework/src/lib/StorageFrameworkEntry'
  import type { DeselectionCallback, SelectedEventDetail } from './SelectedEventDetail'

  import { createEventDispatcher } from 'svelte';

  import TreeNode from './TreeNode.svelte'
  import ActionBar from './ActionBar.svelte';
  
  export let entry: StorageFrameworkDirectoryEntry

  const dispatch = createEventDispatcher()

  let selectedEntry: StorageFrameworkEntry | null = null
  let deselectionCallback: DeselectionCallback | null = null

  const onEntrySelected = (event: CustomEvent<SelectedEventDetail>) => {
    if(selectedEntry !== event.detail.entry) {
      if(deselectionCallback)
        deselectionCallback()
    }

    selectedEntry = event.detail.entry
    deselectionCallback = event.detail.onDeselect
    dispatch("selected", event.detail)
  }
</script>

<ActionBar selectedEntry={selectedEntry} on:close />
<TreeNode {entry} showAsRootNode={true} on:selected={onEntrySelected} />
