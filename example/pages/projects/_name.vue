<template>
  <section class="container">
    <h1> Project: {{ project.name }} </h1>  
    <div v-html="project.content" />
  </section>
</template>

<script>

export default {
  asyncData: ({ app, route }) => ({
    project: app.$content('/projects').get(route.path)
  })
}
</script>
