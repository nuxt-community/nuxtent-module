<template>
<div>
    <h1>{{ page.title }}</h1>
    <nuxtent-body :body="page.body"/>
</div>
</template>

<script>
export default {
  async asyncData ({ app, route }) {
    return {
      page: await app.$content('/').get('/index')
    }
  }
}
</script>
