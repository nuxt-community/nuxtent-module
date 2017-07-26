<template lang="pug">
div.lead-container
  div.guide-main.lead-container
    h2.lead-pitch Seamlessly use content files in your Nuxt.js sites
    p.lead-slogan
      | With Nuxtent installed, creating a content heavy site with Nuxt is as easy
      | as using Jekyll, Hexo, or any other static site generator–except better.
    nuxt-link.lead-link(to="/guide/introduction") Get Started
  div.featured-lesson
    h3 Featured Lesson:
    a(href="/guide/writing#async-components")
      h1.lesson-title Use Vue Components in Your Markdown Files!
</template>

<style lang="sass">
$tablet-width: 640px
$desktop-width: 980px

.lead-pitch
  font-weight: 300
  font-size: 2.5rem
  word-spacing: 4px
  margin-bottom: 1rem
  @media (min-width: $desktop-width)
    font-size: 3rem
.lead-slogan
  margin-top: 1rem
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
  max-width: 100%
  background-color: #fff
  border: 2px solid #35495e
  padding: .5rem 2rem
  border-radius: 5px
  margin-top: 3rem
  margin-bottom: 0rem
  @media (min-width: $desktop-width)
    position: relative
    top: 2rem
    left: -12rem
    width: 88%
  h3
    display: block
    font-size: 90%
    width: 30%
    position: relative
    top: -2rem
    left: -1rem
    background-color: #35495e
    color: #f9f9f9
    padding: .25rem
    text-align: center
    letter-spacing: .025rem
    border-radius: 5px
    font-weight: 300
    @media (min-width: $tablet-width)
      width: 25%
    @media (min-width: $desktop-width)
      width: 22%
      font-size: 85%
  .lesson-title
    margin-top: -2rem
    font-size: 1.75rem
    @media (min-width: $desktop-width)
      font-size: 2rem
  a
    color: #374a62
    text-decoration: none
    &:hover
      text-decoration: underline
    h1
      font-weight: 500
    &hover
      text-decoration: underline
</style>
