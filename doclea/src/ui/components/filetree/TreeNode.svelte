<script lang="ts">
  import type { Editing } from '@src/business-logic/Editing'
  import type {
    ObservableStorageFrameworkDirectoryEntry,
    StorageFrameworkDirectoryEntry,
    StorageFrameworkEntry,
  } from 'storage-framework'
  import { onDestroy } from 'svelte'

  import type { Unsubscriber } from 'svelte/store'

  import ChevronRight from 'tabler-icons-svelte/icons/ChevronRight'
  import File from 'tabler-icons-svelte/icons/File'

  export let state: Editing

  export let entry: StorageFrameworkEntry
  export let showAsRootNode: boolean = false
  export let showChildren = false
  export let indentionLevel = 0

  const getIndentationLevelStyle = (indentionLevel: number) =>
    `--indention-level: calc(${indentionLevel} * var(--ui-padding-500))`

  let children: StorageFrameworkEntry[] = []

  const { selectedEntry } = state
  $: isSelected = $selectedEntry === entry

  let childrenUnsubscriber: Unsubscriber | null = null

  const setupChildren = (): void => {
    const dirEntry = entry as ObservableStorageFrameworkDirectoryEntry

    dirEntry.watchChildren().then((observable) => {
      if (childrenUnsubscriber) childrenUnsubscriber()
      childrenUnsubscriber = observable.subscribe((childs) => {
        children = childs
      })
    })
  }

  $: {
    if (showChildren && childrenUnsubscriber == null) setupChildren()
  }

  onDestroy(() => {
    if (childrenUnsubscriber) childrenUnsubscriber()
  })

  const onSelectClick = (event: Event) => {
    event.stopPropagation()

    state.setSelectedEntry(entry)
  }

  const onArrowClicked = (event: Event) => {
    event.stopPropagation()
    if (!showAsRootNode) showChildren = !showChildren
  }
</script>

{#if entry.isFile}
  <div
    class="entry title {isSelected ? 'selected' : ''}"
    style={getIndentationLevelStyle(indentionLevel)}
    on:click={onSelectClick}
  >
    <span><File /> {entry.name}</span>
  </div>
{:else}
  <div class="entry {isSelected ? 'selected' : ''}" on:click={onSelectClick}>
    {#if showAsRootNode}
      <div class:root={showAsRootNode}>
        <b class="" style={getIndentationLevelStyle(indentionLevel)}
          >{entry.fullPath}</b
        >
      </div>
    {:else}
      <div class="title" style={getIndentationLevelStyle(indentionLevel)}>
        <span
          on:click={onArrowClicked}
          class="arrow"
          class:arrowDown={showChildren}><ChevronRight /></span
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
            {state}
          />
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .root {
    padding: var(--ui-padding-400);
    font-weight: bold;
    /* background-color: rgba(0.7, 0.7, 0.7, 0.4); */
  }

  .entry {
    cursor: pointer;
    font-weight: bold;
  }

  .selected {
    background-color: var(--ui-background-600);
  }

  .title {
    user-select: none;
    padding: var(--ui-padding-300);
    padding-left: var(--indention-level);
  }

  .title:hover {
    background-color: var(--ui-background-400);
  }

  .arrow {
    display: inline-block;
  }

  .arrowDown {
    transform: rotate(90deg);
  }
</style>
