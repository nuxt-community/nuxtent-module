<template>
<div>
  <h1>  Nuxtent </h1>
  <div class="content">
    <h1> {{ lesson.title }} </h1>
    <nuxtent-body :body="lesson.body" />
  </div>
</div>
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
.content {
  width: 45rem
}
</style>
