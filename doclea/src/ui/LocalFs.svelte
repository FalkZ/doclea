<script lang="ts">
  import LocalDirectoryEntry from '@storage-framework/localfs-adapter/LocalDirectoryEntry'

  let target

  //$: console.log(target)

  function dropHandler(event) {
    let entries = event.target['webkitEntries'][0]
    let root = new LocalDirectoryEntry(entries)
    console.log('Root: ', root)
    console.log(
      'Children: ',
      root.getChildren().then((res) => {
        console.log('Read entries from file drop: ', res)
        return res
      })
    )
    console.log(
      'Parent: ',
      root.getParent().then((res) => res)
    )
  }
</script>

<input
  type="file"
  id="filedropper"
  name="fileList"
  on:input={dropHandler}
  multiple
/>

<style>
  #filedropper {
    height: 10vh;
    width: 15vw;
    background-color: aliceblue;
  }
</style>
