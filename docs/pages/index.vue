<template lang="pug">
div.site-container
  div.white-line-container
  div.sidebar-header-container
    a.site-title(href="/") NUXTENT
    div.nav-container
      h3 GUIDE
      ul.nav-links(v-for="item in menu")
        li
          nuxt-link.nav-link(:to="item.link") {{ item.title }}
  div.guide-container
    nuxt-child.guide-content
</template>


<script>
export default {
  data: () => ({
    menu: [
      { title: 'Introduction', link: '/introduction' },
      { title: 'Module Installation and Options', link: '/installation' },
      { title: 'Configuration Your Data', link: '/configuration' },
      { title: 'Fetching the Content', link: '/fetching-content' },
      { title: 'Using Markdown Components', link: '/markdown-components' }
    ]
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
  width: 100%
  height: 5rem
  margin: 0 auto
  border-bottom: .60rem solid #fff

.sidebar-header-container,
.guide-container
  display: inline-block
  vertical-align: top

.sidebar-header-container
  width: 30%
  margin-top: -7.25rem
.guide-container
  width: 65%
  margin-top: -4rem
  background-color: #eff2f6
  color: #374a62
  border: 3px solid #35495e
  padding: 0 1rem 2rem 1rem
  font-size: 1.125rem

.nav-container
  h3
    font-size: 1.125rem
    margin-left: 2.45rem
    margin-bottom: 0
    padding-bottom: 0
    color: #818D9D
    font-weight: 400
    letter-spacing: 0.05rem
  .nav-links
    margin-top: .8rem
    list-style-type: none
    li
      margin-top: -.25rem
  .nav-link
    text-decoration: none
    color: #374a62

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
</style>
