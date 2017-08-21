<template>
<div>
  <div class="content">
    <h1> {{ lesson.title }} </h1>
    <nuxtent-body :body="lesson.body" />
  </div>
</div>
</template>

<script>
export default {
  async asyncData ({ app, params }) {
    return {
      lesson: await app.$content('/').get(params.slug)
    }
  }
}
</script>


<style>
.content {
  width: 45rem
}
</style>
