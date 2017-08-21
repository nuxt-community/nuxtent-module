<template>
<div>
  <h1> {{ post.title }} </h1>
  <nuxtent-body :body="post.body" />
</div>
</template>

<script>
export default {
  async asyncData ({ app, route }) {
    return {
      post: await app.$content('/posts').get(route.path)
    }
  }
}
</script>
