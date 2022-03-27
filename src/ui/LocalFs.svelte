<script lang="ts">
  import type { SFError } from '@lib/SFError'

  import LocalDirectoryEntry from '@src/localfs-adapter/LocalDirectoryEntry'
  import type { LocalFileEntry } from '@src/localfs-adapter/LocalFileEntry'
  import { LocalFileSystem } from '@src/localfs-adapter/LocalFilesystem'

  let target

  function dropHandler(event) {
    event.preventDefault()
    let entry = event.target['webkitEntries'][0]
    let contentRoot = new LocalDirectoryEntry(entry)
    console.log('Content root: ', contentRoot)

    async function test() {
      let base = await new LocalFileSystem().open()
      let children = await contentRoot.getChildren()
      console.log('Children: ', children)
      console.log(
        'Base childs: ',
        await (<LocalDirectoryEntry>base).getChildren()
      )
      for (let child of children) {
        try {
          let file = await (<LocalFileEntry>child).read()
          console.log('File content: ', await file.text())
          let newFile = await (<LocalDirectoryEntry>base).createFile(
            `${child.name}`
          )
          await newFile.save(file)
        } catch (err) {
          console.log(err)
        }
      }
      children = await (<LocalDirectoryEntry>base).getChildren()
      console.log('Children in virtual fs base: ', children)
      try {
        let testDir = await (<LocalDirectoryEntry>base).createDirectory(
          'Testdir'
        )
        await children[0].moveTo(testDir)
        let testDirChildren = await testDir.getChildren()
        console.log('File moved to Testdir ', testDirChildren)
        await testDirChildren[0].remove()
        console.log('File removed from Testdir ', await testDir.getChildren())
      } catch (err) {
        console.log(err)
      }

      // not working, also when trying with root.createDirectory()
      let dir = await contentRoot.getDirectoryEntry()
      let fs = dir.filesystem
      let virtDir = fs.root
      let localvirtdir = new LocalDirectoryEntry(virtDir)
      try {
        await localvirtdir.createDirectory('Testdir2')
        console.log('Created Testdirectory')
      } catch (err) {
        console.log(err)
      }
    }
    test()
  }
</script>

<div>
  <input
    type="file"
    id="filedropper"
    name="fileList"
    on:change={() => dropHandler(event)}
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
