<template>
<div>
  <h1> {{ post.title }} </h1>
</div>
</template>

<script>
export default {
  async asyncData ({ app, route, payload }) {
    return {
      post:await app.$content('/posts').get(route.path) || payload
    }
  }
}
</script>
