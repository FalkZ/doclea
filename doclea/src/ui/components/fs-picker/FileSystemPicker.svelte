<script lang="ts">
  import Button from '../basic-elements/Button.svelte'

  import Folder from 'tabler-icons-svelte/icons/Folder.svelte'
  import BrandGithub from 'tabler-icons-svelte/icons/BrandGithub.svelte'
  import Cloud from 'tabler-icons-svelte/icons/Cloud.svelte'
  import type {
    StorageFrameworkEntry,
    StorageFrameworkProvider,
  } from 'storage-framework'

  import {
    InMemoryFileSystem,
    GithubFileSystem,
    SolidFileSystem,
    LocalFileSystem,
  } from 'storage-framework'

  export let pickedFSEntry: StorageFrameworkEntry | null = null

  const onMemorySelected = (provider: StorageFrameworkProvider) => () => {

    // if (provider.isSignedIn == false) {
    //   provider.authenticate()
    // } else {
      provider.open()
    // }
    // .open().then((entry) => {
    //   pickedFSEntry = entry
    // })
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
