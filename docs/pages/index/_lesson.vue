<template lang="pug">
section.guide-main.content-container
  h1.post-title {{ lesson.title }}
  nuxt-body.guide-content(:body="lesson.body")
</template>

<script>
export default {
  async asyncData ({ app, route, payload }) {
    return {
      lesson: await app.$content('/').get(route.path) || payload
    }
  }
}
</script>

<style lang="sass">
.content-container
  min-height: 80vh
.post-title
  font-size: 2.5rem
  margin-bottom: 1rem

// --------------------
// General Content Styles
// --------------------

$code-background-color: #f9f9f9

.guide-content
  p,
  li
    line-height: 1.4rem
  li
    margin-bottom: .5rem
  a
    color: #818D9D
  // Inline snippets
  code
    padding: .25em .5em
    font-size: 90%
    background-color: $code-background-color
    border-radius: 3px

  // Block-level snippets
  pre
    margin: 1rem
    padding: 1rem
    background-color: $code-background-color
    overflow-x: scroll
    pre code
    font-size: 85%
</style>
