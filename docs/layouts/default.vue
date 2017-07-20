<template lang="pug">
div.site-container
  nuxt.site-main
  div.site-footer
    p Built with Nuxtent by
      |  <a href="https://github.com/alidcastano">@alidcastano</a>.
      | See on <a href="https://github.com/nuxt-community/content-module">Github</a>.
      //- | <a class="github-button" href="https://github.com/nuxt-community/content-module" data-show-count="true" aria-label="Star nuxt-community/content-module on GitHub" />
      //- <script async defer src="https://buttons.github.io/buttons.js"></script>
</template>

<style lang="sass">
$tablet-width: 640px
$desktop-width: 980px

.site-container
  background-color: #eff2f6
  position: relative
  display : table
  border-collapse: collapse
  width: 100vw
  height: 100vh
  margin: -.5rem -.25rem 0 -.5rem
  padding-top: 2rem

.site-footer
  background-color: #35495e
  color: #f9f9f9
  position: absolute
  left: 0
  right: 0
  bottom: -.5rem
  vertical-align : bottom
  padding: .75rem 0
  height: 1.25rem
  p
    text-align: center
    margin: 0
    padding: 0
    display: block
    font-size: .8rem
    @media (min-width: $tablet-width)
      font-size: 1rem
  a
    color: #f9f9f9
</style>
