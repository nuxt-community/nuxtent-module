<template>
  <section class="container">
    <h1> Projects </h1>
     <ul>
       <li v-for="project in projects">
        <nuxt-link :to="'/projects' + project.permalink"> {{  project.name }} </nuxt-link>
      </li> 
    </ul> 
  </section>
</template>

<script>
export default {
  async asyncData ({ app, payload }) {
    console.log('made it here')
    console.log(app)
    return {
      projects: await app.$content('/projects').getAll() || payload
    }
  }
}
</script>
