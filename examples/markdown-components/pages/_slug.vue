<template>
<div>
  <h1>  Markdown Component </h1>
  <div>
    <h1>{{ post.title }}</h1>
    <nuxtent-body  v-if="isObject(post.body)" :body="post.body" />
    <div v-else v-html="post.body" />
    <!-- <ContentComp /> -->
  </div>
</div>
</template>

<script>

export default {
  async asyncData ({ app, route, payload }) {
    return {
      post: payload || await app.$content('/').get(route.params.slug)
    }
  },

  methods: {
    isObject (body) {
      return typeof body === 'object'
    }
  },
  components: {
    // ContentComp: () => import('~/content/HelloWorld.comp.md')
  }
}
</script>
