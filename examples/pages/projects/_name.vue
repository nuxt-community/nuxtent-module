<template>
  <section class="container">
    <h1> Project: {{ project.name }} </h1>
    <div v-html="project.content" />
  </section>
</template>

<script>

export default {
  async asyncData ({ app, route }) {
    return {
      project: await app.$content('/projects').get(route.path)
    }
  }
}
</script>
