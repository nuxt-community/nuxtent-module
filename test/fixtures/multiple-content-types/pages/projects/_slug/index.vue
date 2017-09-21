<template>
  <section class="container">
     <h1>Project: {{ project.name }}</h1>
    <nuxtent-body :body="project.body" />
  </section>
</template>

<script>
export default {
  async asyncData ({ app, route, payload }) {
    return {
      project: payload || await app.$content('/projects').get(route.path)
    }
  }
}
</script>
