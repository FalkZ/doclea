<script lang="ts">
  import type { StorageFrameworkDirectoryEntry } from 'storage-framework'
  import type { Editing } from 'src/business-logic/Editing'

  import TreeNode from './TreeNode.svelte'
  import ActionBar from './ActionBar.svelte'

  export let entry: StorageFrameworkDirectoryEntry
  export let state: Editing
</script>

<ActionBar {state} />
<TreeNode {entry} showAsRootNode={true} {state} showChildren={true} />
