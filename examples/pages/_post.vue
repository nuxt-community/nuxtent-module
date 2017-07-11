<template>
<div>
  <h1> {{ post.title }} </h1>
</div>
</template>

<script>
export default {
  async asyncData ({ app, route }) {
    console.log(await app.$content('/posts').get(route.path))
    return {
      post: await app.$content('/posts').get(route.path)
    }
  }
}
</script>
