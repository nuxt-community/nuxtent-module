<template lang="pug">
div.site-container
  div.white-line-container
  div.sidebar-header-container
    a.site-title(href="/") NUXTENT
    div.nav-container
      h3 GUIDE
      ul.nav-links(v-for="item in menu")
        li.nav-link-container
          nuxt-link.nav-link(:to="item.link")
            | {{ item.title }}
          ul.nav-nested-links(v-if="item.anchors" v-for="anchor in item.anchors")
            li.sub-nav-link-container
              nuxt-link.nav-nested-link(:to="item.link + anchor.link")
                | {{ anchor.title }}
  div.guide-container
    nuxt-child.guide-content
</template>


<script>
import siteMenu from '../nuxt.menu.js'

export default {
  data: () => ({
    menu: siteMenu
  })
}
</script>

<style lang="sass">

.site-container
  min-height: 100vh
  background-color: #eff2f6
  margin: -1rem
  padding: 1rem

.white-line-container
  width: 99%
  height: 5rem
  margin: 0 auto
  border-bottom: .60rem solid #f9f9f9

.sidebar-header-container,
.guide-container
  display: inline-block
  vertical-align: top

.sidebar-header-container
  width: 30%
  margin-top: -7.25rem
.guide-container
  width: 60%
  margin-top: -4rem
  background-color: #eff2f6
  color: #374a62
  border: 3px solid #35495e
  padding: 0 1rem 2rem 1rem
  font-size: 1.125rem

.site-title
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif /* 1 */
  display: block
  font-weight: 600
  font-size: 3.5rem
  color: #35495e
  padding: 0.5rem 1rem
  margin: 1.5rem auto 1.5rem auto
  width: 75%
  text-align: center
  text-decoration: none
  letter-spacing: 1px

.nav-container
  h3
    font-size: 1.125rem
    margin-left: 2.45rem
    margin-bottom: 0
    padding-bottom: 0
    color: #818D9D
    font-weight: 400
    letter-spacing: 0.05rem
  .nav-links,
  .nav-nested-links
    margin-top: .8rem
    list-style-type: none
    li
      margin-top: -.25rem
  .nav-nested-links
    padding-left: 1rem
  .nav-link,
  .nav-nested-link
    text-decoration: none
    color: #374a62

.nav-link-container > .nuxt-link-active
      background-color: #35495e
      color: #f9f9f9
      padding: 0.25rem 0.5rem
      border-radius: 5px
.sub-nav-link-container > .nuxt-link-active
    border-bottom: 2px solid #35495e
</style>
