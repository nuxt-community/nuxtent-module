<p align="center">
<a href="https://david-dm.org/nuxt-community/nuxtent-module">
    <img alt="" src="https://david-dm.org/nuxt-community/nuxtent-module/status.svg?style=flat-square">
</a>
<a href="https://greenkeeper.io/">
    <img alt="" src="https://badges.greenkeeper.io/nuxt-community/nuxtent-module.svg">
</a>
<a href="https://standardjs.com">
    <img alt="" src="https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square">
</a>
<a href="https://circleci.com/gh/nuxt-community/nuxtent-module">
    <img alt="" src="https://img.shields.io/circleci/project/github/nuxt-community/nuxtent-module.svg?style=flat-square">
</a>
<a href="https://codecov.io/gh/nuxt-community/nuxtent-module">
    <img alt="" src="https://img.shields.io/codecov/c/github/nuxt-community/nuxtent-module.svg?style=flat-square">
</a>
<br>
<a href="https://npmjs.com/package/nuxtent">
    <img alt="" src="https://img.shields.io/npm/v/nuxtent.svg?style=flat-square">
</a>
<a href="https://npmjs.com/package/nuxtent">
    <img alt="" src="https://img.shields.io/npm/dt/nuxtent.svg?style=flat-square">
</a>
</p>

<h1 align="center">Nuxtent</h1>

<p align="center">Seamlessly use content files in your Nuxt.js sites.</p>

<p align="center">https://nuxtent.now.sh/</p>

[📖 Release Notes](./CHANGELOG.md)

# Summary

The goal of Nuxtent is to make using Nuxt for content heavy sites as easy as using Jekyll, Hugo, or any other static site generator.

It does in two main ways:

1. By compiling all the data from `markdown` or `yaml` files based on configured rules.
2. By providing helpers for dynamically accessing this data inside Nuxt pages.

But, we didn't just want to make Nuxtent as good as a static site generator–we wanted to make it better.

So, along with that, Nuxtent also supports:

3. The usage of content files in both static sites and dynamic applications.
4. The usage of `Vue components` inside markdown files.
5. Automatic content navigation, between pages via `path` and within pages via `anchors`.

There you go: five reasons to give `Nuxtent` a try, and maybe even star and [share]("https://twitter.com/intent/tweet) it. :smirk:

## Simple yet flexible API

Nuxtent's main focus was to integrate into Nuxt (otherwise, you're just building another Jekyll-like tool, with the same amount of mental overhead).

As a result, the API simple yet flexible. All you have to do is 1) configure the content and 2) fetch the files with the `$content` helper inside the `asyncData` method that is available in Nuxt pages.


Here's a basic example:

```js
// nuxtent.config.js
module.exports = {
  content: {
    page: '/_post',
    permalink: ':year/:slug'
  }
}

// pages/_post.vue
export default {
  asyncData: async ({ app, route }) => ({
    post: app.$content('posts').get(route.path)
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

*Have a site using Nuxtent? Fork the repo and add it to the list below!*

### Personal Sites
- [alidcastano.com](https://alidcastano.com/) [source](https://github.com/alidcastano/alidcastano)

### Documentation Sites
- [ency.now.sh](https://ency.now.sh/) [source](https://github.com/encyjs/docs)


## License

[MIT License](./LICENSE)

Copyright (c) 2017 Nuxt Community
