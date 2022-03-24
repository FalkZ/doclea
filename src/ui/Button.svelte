<script lang="ts"></script>

<button on:click><slot /></button>

<style>
  button {
    box-shadow: rgba(59, 66, 82, 0.14) 0px 1px 1px 0px,
      rgba(59, 66, 82, 0.12) 0px 2px 1px 0px,
      rgba(59, 66, 82, 0.2) 0px 1px 3px 0px;
    box-sizing: border-box;
    color: rgba(46, 52, 64, 0.87);
    border: none;
    letter-spacing: 0.5px;
    border-radius: 3px;
    padding: 1em;
    display: block;
    margin: 1em;
    font-weight: bold;
  }
</style>
