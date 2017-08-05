<template lang="pug">
section.guide-main
  h1.post-title {{ lesson.title }}
  //- TODO replace this when JSX rendering of HTML is fixed
  //- nuxtent-body.guide-content(:body="lesson.body")
  nuxtent-body.guide-content(v-if="isObject(lesson.body)" :body="lesson.body")
  div.guide-content(v-else v-html="lesson.body")
</template>

<script>
export default {
  async asyncData ({ app, params }) {
    return {
      lesson: await app.$content('/').get(params.slug)
    }
  },
  methods: {
    isObject (body) {
      return typeof body === 'object'
    }
  }
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
