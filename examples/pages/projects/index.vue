<template>
  <section class="container">
    <h1> Projects </h1>
    <ul>
      <li v-for="project in projects">
        {{ project.permalink }}
      </li>
    </ul>
  </section>
</template>

<script>
export default {
  asyncData ({ app }) {
    return {
      projects: app.$content('/projects').getAll()
    }
  }
}
</script>
