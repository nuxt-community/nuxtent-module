<template lang="pug">
section.content-container
  Test
  h1.post-title {{ lesson.title }}
  nuxt-body(:body="lesson.body")
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
// Code
// --------------------

$code-background-color: #f9f9f9

// Inline snippets
code
  padding: .25em .5em
  font-size: 80%
  background-color: $code-background-color
  border-radius: 3px

// Block-level snippets
pre
  padding: 1rem
  background-color: $code-background-color
  overflow-x: scroll

// pre code
//   padding: 0
//   font-size: 100%
//   color: inherit
//   background-color: transparent
//   overflow: scroll

</style>
