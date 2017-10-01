<template>
  <iframe id="ytplayer" type="text/html" width="640" height="360"
  :src="this.youtubeUrl"
  frameborder="0" />
</template>

<script>
  export default {
    data () {
      return {
        youtubeUrl: `http://www.youtube.com/embed/${this.videoId}?autoplay=0`
      }
    },
    props: {
      "videoId": {
        type: String,
        required: true
      }
    }
  }
</script>
