<template lang="pug">
section.guide-main
  h1.post-title {{ lesson.title }}
  nuxtent-body.guide-content(:body="lesson.body" id="nuxent-content" tag="section")
</template>

<script>
export default {
  name: 'PagesGuideSlug',
  async asyncData({ app, route }) {
    return {
      lesson: await app.$content('/').get(route.path),
    }
  },
}
</script>

<style lang="sass">
.guide-main
  max-width: 48rem
.post-title
  font-size: 2.5rem
  margin-bottom: 1rem
  // section titles
  h1
    font-size: 2rem
    margin-bottom: 1rem
    padding-bottom: .5rem
    border-bottom: 2px solid #818D9D
</style>
