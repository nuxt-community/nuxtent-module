<template>
<div>
  <h1>Nuxtent TOC</h1>
  <ul>
    <li v-for="lesson in lessons">
      <nuxt-link :to="'/guide' + lesson.permalink"> {{ lesson.title }} </nuxt-link>
      <ul>
        <li v-if="lesson.anchors" v-for="anchor in lesson.anchors">
          <nuxt-link :to="'/guide' + lesson.permalink + anchor[0]">{{ anchor[1] }}</nuxt-link>
        </li>
      </ul>
    </li>
  </ul>
  <nuxt-child />
</div>
</template>

<script>
export default {
  async asyncData ({ app }) {
    return {
      lessons: await app.$content('/')
      .query({ exlcude: ['attributes', 'body'] })
      .getAll()
    }
  }
}
</script>
