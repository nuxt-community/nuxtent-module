<template>
  <section class="container">
    <h1>Projects</h1>
     <ul>
       <li v-for="project in projects">
        <nuxt-link :to="project.permalink">{{ project.name }}</nuxt-link>
      </li>
     </ul>
    <nuxt-child />
  </section>
</template>

<script>
export default {
  async asyncData ({ app }) {
    return {
      projects: await app.$content('/projects').getAll()
    }
  }
}
</script>
