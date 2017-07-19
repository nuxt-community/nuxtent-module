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
</style>
