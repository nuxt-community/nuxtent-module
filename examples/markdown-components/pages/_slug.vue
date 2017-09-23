<template>
<div>
  <h1>  {{ post.title }} </h1>
  <div>
    <nuxtent-body :body="post.body" />
  </div>
</div>
</template>

<script>

export default {
  async asyncData ({ app, route }) {
    return {
      post: await app.$content('/').get(route.params.slug)
    }
  }
}
</script>
