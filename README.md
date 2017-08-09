# Nuxtent

The goal of Nuxtent is to make using Nuxt for content heavy sites as easy as using Jekyll, Hugo, or any other static site generator.

It does in two main ways:

1. By compiling all the data from `markdown` or `yaml` files based on configured rules.
2. By providing helpers for dynamically accessing this data inside Nuxt pages.

But, we didn't just want to make Nuxtent as good as a static site generator–we wanted to make it better.

So, along with that, Nuxtent also supports:

3. The usage of content files in both static sites and dynamic applications.
4. The usage of `Vue components` inside markdown files.

There you go: four reasons to give `Nuxtent` a try, and maybe even star and [share]("https://twitter.com/intent/tweet) it. :smirk:

## Simple yet flexible API

Nuxtent's main focus was to integrate into Nuxt (otherwise, you're just building another Jekyll-like tool, with the same amount of mental overhead).

As a result, the API simple yet flexible. All you have to do is 1) configure the content and 2) fetch the files with the `$content` helper inside the `asyncData` method that is available in Nuxt pages.


Here's a basic example:

```js
// nuxtent.config.js
module.exports = {
  content: {
    page: '/_post'
    permalink: ':year/:slug'
  }
}

// pages/_posts.vue
export default {
  asyncData: async ({ app, route }) => ({
    posts: app.$content('posts').get(route.path)
  })
}
```

## Quick Start

If you're starting a new site, you can use the [nuxtent-starter](https://github.com/nuxt-community/content-template) template.

``` bash
$ vue init nuxt-community/nuxtent-template my-site
$ cd my-site
# install dependencies
$ npm install # Or yarn install
```

## Installation

```
npm install nuxtent --save

```

Then, under `nuxt.config.js` install the module:

```
modules: [
   'nuxtent'
 ]
```

## Documentation

Documentation available at: https://nuxtent.now.sh/ (built with Nuxtent).

## Sites built with Nuxtent

### Personal Sites
- [alidcastano.com](https://alidcastano.com/) [source](https://github.com/alidcastano/alidcastano)

### Documentation Sites
- [ency.now.sh](https://ency.now.sh/) [source](https://github.com/encyjs/docs)

### License

MIT
