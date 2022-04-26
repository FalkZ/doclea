<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import type {
    StorageFrameworkDirectoryEntry,
    StorageFrameworkEntry,
  } from 'storage-framework/src/lib/StorageFrameworkEntry'
  import type { SelectedEventDetail } from './SelectedEventDetail'

  const dispatch = createEventDispatcher()

  export let entry: StorageFrameworkEntry
  export let showAsRootNode: boolean = false
  export let indentionLevel = 0

  let isSelected = false
  let showChildren = true
  let children: StorageFrameworkEntry[] = []

  $: {
    if (entry.isDirectory) {
      const dirEntry: StorageFrameworkDirectoryEntry = <
        StorageFrameworkDirectoryEntry
      >entry
      dirEntry.getChildren().then((childs) => {
        children = childs
      })
      dirEntry.watchChildren().then((observable) => {
        observable.subscribe((childs) => {
          children = childs
        })
      })
    }
  }

  const onSelectClick = (event: Event) => {
    event.stopPropagation()
  
    isSelected = true
    const detail: SelectedEventDetail = {
      entry: entry,
      onDeselect: () => {isSelected = false}
    }
    dispatch('selected', detail)
  };

  const onContextMenu = (event: Event) => {
    event.stopPropagation()
  
    // TODO: context menu
    if (entry.isDirectory)
      (<StorageFrameworkDirectoryEntry>entry).createFile('test')
  };

  const onArrowClicked = (event: Event) => {
    event.stopPropagation()
    if (!showAsRootNode) showChildren = !showChildren
  };
</script>

{#if entry.isFile}
  <div
    class="entry title {isSelected?'selected':''}"
    style="--indention-level: {indentionLevel}em"
    on:click={onSelectClick}
  >
    <span>&#x1f4c3 {entry.name}</span>
  </div>
{:else}
  <div
    class="entry {isSelected?'selected':''}"
    on:click={onSelectClick}
    on:contextmenu|preventDefault={onContextMenu}
  >
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
          on:contextmenu|preventDefault={onContextMenu}
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
    background-color: rgba(0.7, 0.7, 0.7, 0.4);
  }

  .entry {
    cursor: pointer;
  }

  .selected {
    background-color: rgba(0.7, 0.7, 0.7, 0.1);
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
