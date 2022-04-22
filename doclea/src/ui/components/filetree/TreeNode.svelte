<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import type {
    StorageFrameworkDirectoryEntry,
    StorageFrameworkEntry,
  } from 'storage-framework/src/lib/StorageFrameworkEntry'
  import type { FileTreeConfig } from './FileTreeConfig'
  import type { SelectedEventDetail } from './SelectedEventDetail'

  const dispatch = createEventDispatcher()

  export let entry: StorageFrameworkEntry
  export let config: FileTreeConfig
  export let showAsRootNode: boolean = false
  export let indentionLevel = 0

  let showChildren = true
  let children: StorageFrameworkEntry[] = []

  $: {
    if (entry.isDirectory) {
      let dirEntry: StorageFrameworkDirectoryEntry = <
        StorageFrameworkDirectoryEntry
      >entry
      dirEntry.getChildren().then((childs) => {
        children = childs
      })
    }
  }

  function onSelectClick(event: Event) {
    event.stopPropagation()

    if (entry.isDirectory && !config?.selectDirectories) {
      onArrowClicked(event)
      return
    }

    let detail: SelectedEventDetail = {
      entry: entry,
    }
    dispatch('selected', detail)
  }

  function onArrowClicked(event: Event) {
    event.stopPropagation()
    if (!showAsRootNode) showChildren = !showChildren
  }
</script>

{#if entry.isFile}
  <div
    class="entry title"
    style="--indention-level: {indentionLevel}em"
    on:click={onSelectClick}
  >
    <span>&#x1f4c3 {entry.name}</span>
  </div>
{:else}
  <div class="entry" on:click={onSelectClick}>
    {#if showAsRootNode}
      <div class:root={showAsRootNode}>
        <b class="title" style="--indention-level: {indentionLevel}"
          >{entry.fullPath}</b
        >
      </div>
    {:else}
      <div class="title" style="--indention-level: {indentionLevel}em">
        <span
          on:click={onArrowClicked}
          class="arrow"
          class:arrowDown={showChildren}>&#x25b6</span
        >
        <span>{entry.name}</span>
      </div>
    {/if}
    {#if showChildren}
      <div>
        {#each children as child}
          <svelte:self
            entry={child}
            {config}
            indentionLevel={indentionLevel + 1}
            on:selected
          />
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .root {
    background-color: rgba(0.7, 0.7, 0.7, 0.3);
  }

  .entry {
    cursor: pointer;
  }

  .title {
    padding-left: var(--indention-level);
  }

  .title:hover {
    background-color: rgba(0.7, 0.7, 0.7, 0.1);
  }

  .arrow {
    display: inline-block;
  }

  .arrowDown {
    transform: rotate(90deg);
  }
</style>
