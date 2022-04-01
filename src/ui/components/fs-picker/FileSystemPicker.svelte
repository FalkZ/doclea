<script lang="ts">
  import Button from '../Button.svelte'

  import Folder from 'tabler-icons-svelte/icons/Folder.svelte'
  import BrandGithub from 'tabler-icons-svelte/icons/BrandGithub.svelte'
  import Cloud from 'tabler-icons-svelte/icons/Cloud.svelte'
  import type { StorageFrameworkEntry } from '@lib/StorageFrameworkEntry'
  import { InMemoryFileSystem } from '@/memory-adapter/InMemoryFileSystem'

  export let pickedFSEntry: StorageFrameworkEntry | null = null

  const onMemorySelected = (_) => {
    new InMemoryFileSystem().open().then((entry) => {
      pickedFSEntry = entry
    })
  }
</script>

<Button><Folder /> Open Local File</Button>
<Button><BrandGithub /> Open Github Project</Button>
<Button><Cloud /> Open Solid Folder</Button>
<Button on:click={onMemorySelected}>Open In Memory Folder</Button>
