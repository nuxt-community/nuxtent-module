<template lang="pug">
div.site-container
  nuxt.site-main
  div.site-footer
    p Built with Nuxtent by
      |  <a href="https://github.com/alidcastano">@alidcastano</a>.
      | See on <a href="https://github.com/nuxt-community/content-module">Github</a>.
      //- | <a class="github-button" href="https://github.com/nuxt-community/content-module" data-show-count="true" aria-label="Star nuxt-community/content-module on GitHub" />
  <script async defer src="https://buttons.github.io/buttons.js"></script>
</template>

<style lang="sass">
.site-container
  background-color: #eff2f6
  margin: 0
  padding: 0
  min-height: 100vh
  margin: -1rem

.site-footer
  background-color: #35495e
  color: #f9f9f9
  position: relative
  top: 3rem
  padding: .75rem 0
  height: 1.25rem
  p
    text-align: center
    margin: 0
    padding: 0
  a
    color: #f9f9f9
</style>
