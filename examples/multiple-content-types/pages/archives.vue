<template>
  <section class="container">
    <h1> Posts </h1>
     <ul>
       <li v-for="post in posts">
        <nuxt-link :to="post.permalink">{{ post.title }}</nuxt-link>
      </li>
    </ul>
  </section>
</template>

<script>
export default {
  async asyncData ({ app }) {
    return {
      posts: await app.$content('/posts').getAll()
    }
  }
}
</script>
