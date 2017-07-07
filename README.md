# Nuxt-Content

`nuxt-content` facilitates the usage of markdown files in content heavy sites.
It does this first, by compiling all the data from markdown files based on configured rules and second, by providing helper methods for dynamically accessing this data inside Nuxt pages.

Best of all, `nuxt-content` is a lightweight abstraction that does as little work as possible. Nuxt is already great, so we only need to add a little bit of sugar on top to handle the content. :)

## Installation

```
npm install nuxt-content

```

Then, under `nuxt.config.js` install the module:

```
modules: [
   '@nuxtjs/content'
 ]
```
