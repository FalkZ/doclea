<script lang="ts">
  import Button from '../Button.svelte'

  import Folder from 'tabler-icons-svelte/icons/Folder.svelte'
  import BrandGithub from 'tabler-icons-svelte/icons/BrandGithub.svelte'
  import Cloud from 'tabler-icons-svelte/icons/Cloud.svelte'
  import type {
    StorageFrameworkEntry,
    StorageFrameworkProvider,
  } from 'storage-framework/src/lib/StorageFrameworkEntry'
  import { InMemoryFileSystem } from 'storage-framework/src/memory-adapter/InMemoryFileSystem'
  import { GithubFileSystem } from 'storage-framework/src/github-adapter/GithubFileSystem'
  import { SolidFileSystem } from 'storage-framework/src/solid-adapter/SolidFileSystem'
  import { LocalFileSystem } from 'storage-framework/src/local-fs-adapter/LocalFileSystem'

  export let pickedFSEntry: StorageFrameworkEntry | null = null

  const onMemorySelected = (provider: StorageFrameworkProvider) => () => {
    provider.open().then((entry) => {
      pickedFSEntry = entry
    })
  }
</script>

<Button on:click={onMemorySelected(new LocalFileSystem())}
  ><Folder /> Open Local File</Button
>
<Button on:click={onMemorySelected(new GithubFileSystem())}
  ><BrandGithub /> Open Github Project</Button
>
<Button on:click={onMemorySelected(new SolidFileSystem())}
  ><Cloud /> Open Solid Folder</Button
>
<Button on:click={onMemorySelected(new InMemoryFileSystem())}
  >Open In Memory Folder</Button
>
