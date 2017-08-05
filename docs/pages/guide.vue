<template lang="pug">
div.main-container
  div.white-line-container
  div.sidebar-header-container
    a.site-title(href="/") NUXTENT
    div.nav-container
      button.mobile-menu-button.menu-label(@click="toggleDisplay") GUIDE
      div.menu-container(:style="menuStyle")
        ul.nav-links(v-for="lesson in menu")
          li.nav-link-container
            nuxt-link.nav-link(:to="'/guide' + lesson.permalink") {{ lesson.title }}
            ul.nav-nested-links(
                v-if="lesson.anchors && lesson.showAnchors"
                v-for="anchor in lesson.anchors"
              )
              li.sub-nav-link-container
                nuxt-link.nav-nested-link(:to="'/guide' + lesson.permalink + anchor[0]")
                  | {{ anchor[1] }}
  div.guide-container(:style="guideStyle")
    nuxt-child
</template>


<script>
export default {
  asyncData: async ({ app, route }) => ({
    showMenu: false,
    showGuide: true,
    updateAnchors: false,
    guide: (await app.$content('/').getAll())
      .sort((p1, p2) => p1.order - p2.order)
  }),

  computed: {
    menu () {
      return this.guide.map(lesson => {
        if ('/guide' + lesson.permalink === this.$route.path) lesson.showAnchors = true
        else lesson.showAnchors = false
        return lesson
      })
    },
    menuStyle () {
      return { 'display': this.showMenu ? 'block' : 'none' }
    },
    guideStyle () {
      return { 'display': this.showGuide ? 'inline-block' : 'none' }
    }
  },
  watch: {
    '$route' () {
       this.updateAnchors = !this.updateAnchors
    }
  },
  methods: {
    toggleDisplay () {
      // display of content and menu is inversed to allow absolute menu overlay
      this.showMenu = !this.showMenu
      this.showGuide = !this.showGuide
    }
  }
}
</script>

<style lang="sass">

$tablet-width: 640px
$desktop-width: 980px

.main-container
  padding-top: 1rem

.white-line-container
  width: 95%
  height: 3.5rem
  margin: 0 auto
  border-bottom: .60rem solid #fff
  @media (min-width: $desktop-width)
    height: 5rem

.sidebar-header-container,
.guide-container
  margin-bottom: 5rem
  @media (min-width: $desktop-width)
    display: inline-block
    vertical-align: top

.guide-container
  max-width: 100%
  margin: 0 auto
  margin-top: -4rem
  margin-bottom: 5rem
  padding: 1rem
  @media (min-width: $tablet-width) and (max-width: $desktop-width)
    padding-left: 3rem
    padding-right: 3rem
  @media (min-width: $desktop-width)
    width: 62%
    font-size: 1.125rem
    padding: 0
  .guide-main
    display: block
    background-color: #fff
    color: #374a62
    border: 3px solid #35495e
    padding: 1rem
    h1,
    h2
      margin: .5rem
    @media (min-width: $desktop-width)
      padding: 2rem
      margin-left: 1rem

.sidebar-header-container
  width: 100%
  margin-top: -7.25rem
  .site-title,
  .nav-container
    display: inline-block
  @media (min-width: $desktop-width)
    width: 23rem
    .nav-container,
    .site-title
      display: block
      width: 80%

.site-title
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif /* 1 */
  display: block
  font-weight: 600
  font-size: 2.35rem
  color: #35495e
  margin-top: 2rem
  padding: 1rem 0 .5rem 1.5rem
  text-decoration: none
  letter-spacing: 1px
  @media (min-width: $tablet-width)
    font-size: 2.75rem
  @media (min-width: $desktop-width)
    font-size: 3.5rem
    margin: 1.5rem 0 1.5rem 2.5rem
    padding: 0.5rem 1rem

.nav-container
  position: relative
  bottom: .25rem
  margin-left: 1rem
  @media (min-width: $desktop-width)
    margin-left: 1.25rem
  .menu-label
    background-color: #35495e
    color: #fff
    border-radius: 5px
    display: block
    font-size: 1.25rem
    padding: .5rem
    font-weight: 400
    letter-spacing: 0.05rem
    border: none
    outline: none
    @media (min-width: $desktop-width)
      color: #818D9D
      background-color: inherit
      margin-left: 2rem
      pointer-events: none
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
  .menu-container
    position: fixed
    top: 6rem
    left: 0
    bottom: 0
    height: 100%
    width: 100%
    background-color: #eff2f6
    @media (min-width: $desktop-width)
      display: block !important
      position: relative
      top: 0

.nav-link-container > .nuxt-link-active
      background-color: #35495e
      color: #f9f9f9
      padding: 0.25rem 0.5rem
      border-radius: 5px
.sub-nav-link-container > .nuxt-link-active
    border-bottom: 2px solid #35495e
</style>
