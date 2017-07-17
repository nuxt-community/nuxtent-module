<template lang="pug">
  section.home-container
    div
      h2.home-slogan Seamlessly use content files in your Nuxt.js sites.
      p With Nuxtent installed, creating a content heavy site with Nuxt is as easy as using Jekyll, Hexo, or any other static site generator.
      div.home-links
        nuxt-link.button--green(to="/guide/introduction") Get Started
        a.button--grey(href="https://github.com/nuxt-community/content-module" target="_blank") See on Github
      </div>
</template>

<style lang="sass">
.home-container
  display: flex
  justify-content: center
  align-items: center
  text-align: center


.home-slogan
  font-weight: 300
  font-size: 42px
  color: #526488
  word-spacing: 5px
  padding-bottom: 15px

.home-links
  padding-top: 15px

</style>
