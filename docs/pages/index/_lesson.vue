<template lang="pug">
section.guide-main.content-container
  h1.post-title {{ lesson.title }}
  nuxtent-body.guide-content(:body="lesson.body")
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
.guide-content
  h1
    font-size: 2rem
    margin-bottom: 1rem
    padding-bottom: .5rem
    border-bottom: 2px solid #818D9D
</style>
