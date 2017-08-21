<template>
<div>
  <h1> All Posts </h1>
  <ul>
    <li v-for="post in posts">
      <nuxt-link :to="post.permalink">{{ post.title }}</nuxt-link>
    </li>
  </ul>
</div>
</template>

<script>
export default {
  async asyncData ({ app }) {
    return {
      posts: await app.$content('/').getAll()
    }
  }
}
</script>
