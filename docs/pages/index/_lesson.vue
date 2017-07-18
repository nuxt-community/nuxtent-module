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
</style>
