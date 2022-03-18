<script lang="ts">
  import LocalDirectoryEntry from '../localfs-adapter/LocalDirectoryEntry'

  let target

  //$: console.log(target)

  function dropHandler(event) {
    console.log(' --------------', event)
    let root = new LocalDirectoryEntry(event.target['webkitEntries'][0])
  }

  function dragHandler(event) {
    event.target.classList.add('selected')
  }
</script>

<input
  type="file"
  id="filedropper"
  name="fileList"
  on:input={dropHandler}
  on:dragover={dragHandler}
  multiple
/>

<style>
  #filedropper.selected {
    background-color: red;
  }

  #filedropper {
    height: 100px;
    width: 200px;
    background-color: aliceblue;
  }
</style>
