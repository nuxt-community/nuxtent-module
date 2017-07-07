<template>
<div>
  <h1> {{ post.title }} </h1>
</div>
</template>

<script>
export default {
  asyncData: ({ app, route }) => {
    return {
      post: app.$content('/posts').get(route.path)
    }
  }
}
</script>
