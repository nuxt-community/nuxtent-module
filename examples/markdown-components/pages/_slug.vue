<template>
<div>
  <h1>  Nuxtent </h1>
  <div>
    <h1> {{ post.title }} </h1>
    <nuxtent-body :body="post.body" />
  </div>
</div>
</template>

<script>
export default {
  async asyncData ({ app, route, payload }) {
    return {
      post: await app.$content('/').get(route.path) || payload
    }
  }
}
</script>
