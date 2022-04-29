<script lang="ts">
import type { StorageFrameworkEntry, StorageFrameworkDirectoryEntry } from "storage-framework/src/lib/StorageFrameworkEntry";

    export let selectedEntry: StorageFrameworkEntry | null = null

    const canCreate = selectedEntry?.isDirectory
    const canRemove = selectedEntry != null

    const createFolder = () => {
        (selectedEntry as StorageFrameworkDirectoryEntry).createDirectory("new folder")
    }

    const createFile = () => {
        (selectedEntry as StorageFrameworkDirectoryEntry).createFile("new file")
    }

    const removeEntry = () => {
        selectedEntry?.remove()
    }
</script>

<div id="actionbar">
    {#if selectedEntry != null}
    <span id="create-folder"
        disabled={!canCreate}
        on:click={createFolder}
        >+ folder</span>
    <span id="create-file"
        disabled={!canCreate}
        on:click={createFile}
        >+ file</span>
    <span id="remove-entry"
        disabled={!canRemove}
        on:click={removeEntry}
        >remove</span>
    {/if}
</div>

<style>
    span {
        margin: 1em;
        cursor: pointer;
    }
    span:hover {
        background-color: rgba(0.7, 0.7, 0.7, 0.1);
    }
</style>