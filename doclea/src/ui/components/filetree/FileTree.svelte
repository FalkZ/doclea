<script lang="ts">
  import TreeNode from './TreeNode.svelte'

  import type { StorageFrameworkDirectoryEntry } from 'storage-framework/src/lib/StorageFrameworkEntry'

  import type { FileTreeConfig } from './FileTreeConfig'

  export let config: FileTreeConfig | null
  export let entry: StorageFrameworkDirectoryEntry
</script>

<TreeNode {entry} {config} showAsRootNode={true} on:selected />
