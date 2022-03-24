<script lang="ts">
  import LocalDirectoryEntry from '@src/localfs-adapter/LocalDirectoryEntry'

  let target

  //$: console.log(target)

  function dropHandler(event) {
    let root = new LocalDirectoryEntry(event.target['webkitEntries'][0])
    console.log('Root: ', root)
    console.log(
      'Children: ',
      root.getChildren().then((res) => res)
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
  webkitdirectory
/>

<style>
  #filedropper {
    height: 10vh;
    width: 15vw;
    background-color: aliceblue;
  }
</style>
