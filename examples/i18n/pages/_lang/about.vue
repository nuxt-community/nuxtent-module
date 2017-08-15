<template>
  <div class="Content">
    <h3> {{ message.body.title }}</h3>
    <p> {{ message.body.introduction }}</p>
  </div>
</template>

<script>
export default {
  async asyncData ({ app, params }) {
    return {
      message: await app.$content(params.lang).get('about')
    }
  }
}
</script>
