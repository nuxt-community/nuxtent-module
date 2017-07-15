<template>
<div>
  <h1> {{ post.title }} </h1>
  <div class="post-content" v-html="post.body" />
</div>
</template>

<script>
export default {
  async asyncData ({ app, route, payload }) {
    return {
      post: await app.$content('/posts').get(route.path) || payload
    }
  }
}
</script>
