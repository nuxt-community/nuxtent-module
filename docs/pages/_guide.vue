<template>
<section class="content-container">
  <h1 class="post-title"> {{ lesson.title }} </h1>
  <nuxt-body :body="lesson.body" />
</section>
</template>

<script>
export default {
  async asyncData ({ app, route, payload }) {
    return {
      lesson: await app.$content('/').get(route.path) || payload
    }
  }
}
</script>

<style>
.content-container
{
  padding: 2rem 1rem;
  width: 38rem;
  margin: 0 auto
}

.post-title
{
  font-size: 2.5rem;
  margin-bottom: 1rem
}

</style>
