<template lang="pug">
div.lead-container
  div.guide-main.lead-container
    h2.lead-pitch Seamlessly use content files in your Nuxt.js sites
    p.lead-slogan
      | With Nuxtent installed, creating a content heavy site with Nuxt is as easy
      | as using Jekyll, Hexo, or any other static site generator–except better.
    nuxt-link.lead-link(to="/introduction") Get Started
  div.featured-lesson
    h3 Featured Lesson:
    a(href="/writing-content#async-components")
      h1.lesson-title Use Vue Components in Your Markdown Files!
</template>


<style lang="sass">
.lead-pitch
  font-weight: 300
  font-size: 3rem
  word-spacing: 4px
  margin-bottom: 1rem
.lead-slogan
  margin-top: 0rem
  line-height: 1.5rem
.lead-link
  display: inline-block
  background-color: #374a62
  color: #fff
  font-size: 1.5rem
  border-radius: 5px
  padding: 1rem
  margin: .25rem
  text-decoration: none

.featured-lesson
  position: relative
  top: 4rem
  left: -14rem
  width: 100%
  background-color: #f9f9f9
  border: 2px solid #35495e
  padding: .5rem 2rem
  border-radius: 5px
  margin-bottom: 5rem
  h3
    display: block
    font-size: 85%
    position: relative
    top: -2rem
    left: -1rem
    background-color: #35495e
    color: #f9f9f9
    width: 22%
    padding: .25rem
    text-align: center
    letter-spacing: .025rem
    border-radius: 5px
    font-weight: 300
  .lesson-title
    margin-top: -2rem
    font-size: 2rem
  a
    text-decoration: none
    color: #374a62
    h1
      font-weight: 500
    &hover
      text-decoration: underline
</style>
