<template>
  <section class="container">
    {{ project }}
    <!-- <h1> Project: {{ project.name }} </h1>
    <div v-html="project.content" /> -->
  </section>
</template>

<script>
export default {
  async asyncData ({ app, route, isServer }) {
    return {
       project: await app.$content('/projects').get(route.path)
    }
  }
}
</script>
