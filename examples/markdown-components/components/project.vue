<template>
  <div> <h1> {{ name || 'Hello World!!' }}</h1></div>
</template>


<script>
export default {
  props: ['name']
}
</script>
