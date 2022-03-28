<script lang="ts">
  import type { SFError } from '@lib/SFError'
  import type { StorageFrameworkEntry } from '@lib/StorageFrameworkEntry'

  import LocalDirectoryEntry from '@src/localfs-adapter/LocalDirectoryEntry'
  import type { LocalFileEntry } from '@src/localfs-adapter/LocalFileEntry'
  import { LocalFileSystem } from '@src/localfs-adapter/LocalFilesystem'

  var base: StorageFrameworkEntry

  if (window.requestFileSystem || window.webkitRequestFileSystem) {
    new LocalFileSystem().open().then((entry) => (base = entry))
  }

  function dropHandler(event) {
    event.preventDefault()
    let entry = event.target['webkitEntries'][0]
    let contentRoot = new LocalDirectoryEntry(entry)
    console.log('Content root: ', contentRoot)

    if (base) {
      // on supported browser
      ;(async () => {
        let children = await contentRoot.getChildren()
        for (let child of children) {
          try {
            if (child.isFile) {
              let file = await (<LocalFileEntry>child).read()
              let newFile = await (<LocalDirectoryEntry>base).createFile(
                `${child.name}`
              )
              await newFile.save(file)
            } else {
              let dir = await (<LocalDirectoryEntry>base).createDirectory(
                child.name
              )
            }
          } catch (err) {
            console.log(err)
          }
        }
        console.log(
          'Copied user selected files to local file system: ',
          await (<LocalDirectoryEntry>base).getChildren()
        )
      })()
    } else {
      // unsupported browser, most local file operations will fail
      console.log(
        'No local fs available, using input folder as base. Most local file operations except from reading will fail'
      )
      base = contentRoot
    }
  }
</script>

<div>
  <input
    type="file"
    id="filedropper"
    name="fileList"
    on:change={(ev) => dropHandler(ev)}
    multiple
  />
</div>

<style>
  #filedropper {
    height: 10vh;
    width: 15vw;
    background-color: rgba(229, 236, 243, 0.445);
    padding: 1em;
    margin: 1em;
  }
</style>
