<script lang="ts">
  import Editor from './Editor.svelte'
  import content from './demo.md?raw'
  import Button from './Button.svelte'
  import LocalFs from './LocalFs.svelte'

  import Folder from 'tabler-icons-svelte/icons/Folder.svelte'
  import BrandGithub from 'tabler-icons-svelte/icons/BrandGithub.svelte'
  import Cloud from 'tabler-icons-svelte/icons/Cloud.svelte'
  import { LocalFileSystem } from '@storage-framework/localfs-adapter/LocalFilesystem'
  import type LocalDirectoryEntry from '@storage-framework/localfs-adapter/LocalDirectoryEntry'

  function openLocalFs() {
    ;(async (): Promise<void> => {
      try {
        let root = await new LocalFileSystem().open()
        console.log(root)
        ;(<LocalDirectoryEntry>root)
          .createFile('Testfile')
          .then((file) => {
            file.save(new File(['test'], 'testfile'))
            return file
          })
          .then((file) => {
            ;(<LocalDirectoryEntry>root).getChildren().then((children) => {
              console.log('Read children from root: ', children)
              return children
            })
            return file
          })
      } catch (err) {
        console.log(err.reason)
      }
    })()
  }
</script>

<main>
  <LocalFs />
  <div id="sidepane">
    <Button on:click={openLocalFs}><Folder /> Open Local File</Button>
    <Button><BrandGithub /> Open Github Project</Button>
    <Button><Cloud /> Open Solid Folder</Button>
  </div>
  <Editor defaultValue={content} />
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  :global(html, body) {
    height: 100%;
    margin: 0;
  }
  main {
    display: grid;
    grid-template-columns: minmax(150px, 300px) 1fr;
    height: 100vh;
  }
  :global(.icon-tabler) {
    height: 2em;
    margin-top: -0.5em;
    margin-bottom: -0.5em;
    position: relative;
    top: 0.1em;
  }
  #sidepane {
    position: sticky;
    top: 0;
    height: 100vh;
  }
</style>
