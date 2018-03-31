<p align="center">
  <img src="https://user-images.githubusercontent.com/5158436/30198986-d4c5d7f8-9485-11e7-9c3e-8b5f5f061f5f.png" />
</p>

<p align="center">

<a href="https://david-dm.org/nuxt-community/nuxtent-module">
  <img src="https://david-dm.org/nuxt-community/nuxtent-module/status.svg?style=flat-square" />
</a>

<a href="https://greenkeeper.io/">
  <img src="https://badges.greenkeeper.io/nuxt-community/nuxtent-module.svg" />
</a>

<a href="https://standardjs.com">
  <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square" />
</a>

<br />

<a href="https://circleci.com/gh/nuxt-community/nuxtent-module">
  <img src="https://img.shields.io/circleci/project/github/nuxt-community/nuxtent-module/master.svg?style=flat-square" />
</a>

<a href="https://ci.appveyor.com/project/medfreeman/nuxtent-module">
  <img src="https://img.shields.io/appveyor/ci/medfreeman/nuxtent-module/master.svg?style=flat-square&logo=appveyor" />
</a>

<a href="https://codecov.io/gh/nuxt-community/nuxtent-module">
  <img src="https://img.shields.io/codecov/c/github/nuxt-community/nuxtent-module.svg?style=flat-square" />
</a>

<br />

<a href="https://npmjs.com/package/nuxtent">
  <img src="https://img.shields.io/npm/v/nuxtent.svg?style=flat-square" />
</a>

<a href="https://npmjs.com/package/nuxtent">
  <img src="https://img.shields.io/npm/dt/nuxtent.svg?style=flat-square" />
</a>

</p>

<h1 align="center">Nuxtent</h1>

<p align="center">Use markdown files in Nuxt.js.</p>

<p align="center">https://nuxtent.now.sh/</p>

[📖 Release Notes](./CHANGELOG.md)

## Summary

Nuxtent allows you to use markdown files as content in your Nuxt.js application. 
It combines the ease-of-use of markdown for writing content, with the power of [https://nuxtjs.org]Nuxt.js for building advanse sites and web applications.

In combination with Nuxt's *generate* mode to generate a static site, Nuxtent allows you to seamlessly port your site's content from Jekyll, Hugo, or other static site generators.

## Features

 - Simple configuration
 - Allows you to override settings for the markdown parser ([markdown-it](https://github.com/markdown-it/markdown-it)), and use its plugins
 - Support both blog posts or similar *flat* content structures, and a nested hierarchy of markdown content
 - Adds useful info to your markdown page's meta info, including:
   - Any data your specify in the config file
   - A breadcrumbs trail for hierarchical markdown content
   - (the info for) a table of contents
 - Support for using vue components inside your markdown content
 - Adds the `$content` helper to Nuxt to allow your to access your markdown content and metadata inside Nuxt pages

## Quick Start

If you're starting a new site, you can use the [nuxtent-starter](https://github.com/nuxt-community/content-template) template.

``` bash
$ vue init nuxt-community/nuxtent-template my-site
$ cd my-site
# install dependencies
$ npm install # Or yarn install
```

If you already have a site, follow these three steps:

 - Step 1: Pick your mode
   - Single directory of markdown files --- typically blog posts or similar
   - Nested structure of markdown files --- typically documentation or similar
 - Step 2: Place your files in the `content` directory`
 - Step 3: Configure your content

That's it, you're done.

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

## Configuration

Nuxtent looks for its configuration in the `nuxtent.config.js` file in the root of your application.

### Content configuration

Here are the configuration options for your content:

Name              | Description                                                           | Default
------------------|-----------------------------------------------------------------------|-----------------------------------
`page`            | The Nuxt page that will serve the dynamic routes to your content.     | 
`permalink`       | The permalink under which your content will be available              | 
`isPost`          | Whether your markdown files have YYYY-MM-DD-slug.mg format or not.    | `true`
`data`            | An object of key/value pairs that will get added to your frontmatter. | `false`
`breadcrumbs`     | Whether to generate a breadcrumb trail or not.                        | `false`
`toc`             | Controls the (optional) generate of a table of contents.              | `false`

Each of these apply to a folder in the `content` directory. You can have multiple, and different, configurations side by side.

Here's an example that covers most use cases:

> Note that the path doesn't have to be a top-level directory. It can also be something like `docs/translations/fr`
```js
// nuxtent.config.js
module.exports = {
  content: [
    // My blog posts are in content/blog
    ['blog', {
      page: '/blog/_blogpost',
      permalink: '/blog/:slug'
    }],
    // My documentation is in content/docs
    ['docs', {
      page: '/docs/_page',
      permalink: '/docs/:section*/:slug',
      isPost: false,
      data: { 
        generatedBy: 'Nuxt with the nuxtent module' 
      },
      breadcrumbs: true,
      toc: 1
  ]
}
```

We have two content groups:

 - The `blog` directory holds posts (remember, `isPost` defaults to `true`)
   - Their dynamic routes will be served by the page `approot/pages/blog/_blogpost`
   - Their permalink will be `/blog/:slug`
 - The `docs` directory holds regular markdown files
   - Their dynamic routes will be served by the page `approot/pages/docs/_blogpost`
   - Their permalink will be `/docs/:section*/:slug`
   
In this example, our `content` direcory is structured like this:

 - *Nuxt app root*
   - content
     - blog
       - 2017-11-14-hello-world.md
       - 2017-12-14-happy-holidays.md
       - 2018-01-14-pizza-party.md
       - 2018-03-21-when-in-rome.md
     - docs
       - about.md
       - examples
         - building-a-pizza-oven.md
         - index.md
         - pizza-from-scratch.md
       - index.md
       - license.md
       - tutorial
         - index.md
         - part-1.md
         - part-2.md
         - part-3.md

Which would lead to this permalink structure on our website:

 - [/blog/hello-world/index.html]
 - [/blog/hello-world/happy-holidays/index.html]
 - [/blog/hello-world/pizza-party/index.html]
 - [/blog/hello-world/when-in-rome/index.html]
 - [/docs/index.html]
 - [/docs/about/index.html]
 - [/docs/license/index.html]
 - [/docs/examples/index.html]
 - [/docs/examples/building-a-pizza-over/index.html]
 - [/docs/examples/pizza-from-scratch/index.html]
 - [/docs/tutorial/index.html]
 - [/docs/tutorial/part-1/index.html]
 - [/docs/tutorial/part-2/index.html]
 - [/docs/tutorial/part-3/index.html]


#### Permalink configuration

The permalink configuration can take a number of placeholdes:

 - `:slug` : A slugified version of your filename (without the date for posts)
 - `:year` : Year of the post (only relevant when `isPost` is `true`)
 - `:month` : Month of the post (only relevant when `isPost` is `true`)
 - `:day` : Day of the post (only relevant when `isPost` is `true`)
 - `:section` : The subdirectory within your content directory. See below.

#### Understanding sections

The `:section` part of your permalink deserves a bit more attention. 
It is the subdirectory from the top of your content group to your markdown file.

For blog posts, the section will always be `/` as all our posts are under the root of our `blog` directory.

But in docs, the section will be be the name of the directory you configured to hold your blog posts.
In our example, the `section` is `blog`

Remember, here's a quick recap of our `blog` configuration:

```
['blog', {
  page: '/blog/_blogpost',
  permalink: '/blog/:slug'
}]
```

 - The `blog` directory holds posts (remember, `isPost` defaults to `true`)
 - Their dynamic links will be served by the page `approot/pages/blog/_blogpost`
 - Their permalink will be `/blog/:slug`


// pages/_post.vue
export default {
  asyncData: async ({ app, route }) => ({
    post: app.$content('posts').get(route.path)
  })
}
```



## Documentation

Documentation available at: https://nuxtent.now.sh/ (built with Nuxtent).

## Sites built with Nuxtent

*Have a site using Nuxtent? Fork the repo and add it to the list below!*

### Personal Sites
- [alidcastano.com](https://alidcastano.com/) [source](https://github.com/alidcastano/alidcastano)
- [patternworks.com.au](https://patternworks.com.au/) [source](https://github.com/callumflack/patternworks-2018)

### Documentation Sites
- [ency.now.sh](https://ency.now.sh/) [source](https://github.com/encyjs/docs)


## License

[MIT License](./LICENSE)

Copyright (c) 2017 Nuxt Community
