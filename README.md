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
`permalink`       | The permalink under which your content will be available.             | 
`isPost`          | Whether your markdown files have YYYY-MM-DD-slug.mg format or not.    | `true`
`data`            | An object of key/value pairs that will get added to your frontmatter. | `false`
`breadcrumbs`     | Whether to generate a breadcrumb trail or not.                        | `false`
`toc`             | Controls the (optional) generate of a table of contents. (see below)  | `false`
`markdown`        | Options for the markdown parser. (see below)                          |

Each of these apply to a folder in the `content` directory. You can have multiple, and different, configurations side by side.

#### `page`

This is the Nuxt page that will serve the dynamic routes to your content. As such, it's always a file somewhere in `app/pages` that starts with an underscore (as that's how Nuxt knows it's for dynamic routes)

> This config option has no default and must be configured.

#### `permalink`

The permalink under which the content will be available in the browser.

> Note: This will be different from the link under which we access it in the content api (see below).

The permalink configuration can take a number of placeholdes:

 - `:slug` : A slugified version of your filename (without the date for posts)
 - `:year` : Year of the post (only relevant when `isPost` is `true`)
 - `:month` : Month of the post (only relevant when `isPost` is `true`)
 - `:day` : Day of the post (only relevant when `isPost` is `true`)
 - `:section` : The subdirectory within your content directory. See below.

The `:section` part of your permalink deserves a bit more attention. 
It is the subdirectory path from the top of your content group to your markdown file.

For a markdown file in the root of our content folder, the section wil be `/`. But for `subdir1/subdir2/somepage.md` the section will be `subdir1/subdir2`.

> This config option has no default and must be configured.

#### `isPost`

Whether or not your markdown content are posts.

When this is `true` (the default) your markdown filenames should start with `YYYY-MM-DD-` which will be used as the post date.

When this is `false` your markdown files should just have names like `somepage.md`.

#### `data`

An object of key/value pairs that will get added to the frontmatter/metadata of all your markdown files for this content group.

#### `breadcrumbs`

If set to `true` this will include metadata to build a trail from your content trunk to the content leaf.

It will not include trunk or leaf, but only the intermediate steps. For example:

 - If our content is in folder `docs`:
   - `docs/about.md` will have no breadcrumbs, as `docs` is the trunk and `docs/about` is the leaf
   - `docs/example/something.md` will have 1 breadcrumb for `docs/example`

#### `toc`

Whether to generate (the metadata for) a table of contents or not. Defaults to `false`, no table of contents.

This uses the [markdown-it-anchor](https://github.com/valeriangalliat/markdown-it-anchor) plugin
for [markdown-it](https://github.com/markdown-it/markdown-it) under the hood.

##### `toc` as an integer

If you set `toc` to an integer, the anchors plugin will be configured as follows:

Name              | Description                                               |
------------------|-----------------------------------------------------------|
`level`           | The value your set `toc` to in your content configuration |
`permalink`       | `true`                                                    |
`permalinkClass`  | `nuxtent-toc`                                             |
`permalinkSymbol` | 🔗                                                        |

##### `toc` as an object

If you don't like these defaults, you can pass your own configuration object to configure the plugin. 
See [the official documentation](https://github.com/valeriangalliat/markdown-it-anchor)

##### Excluding titles from your table of contents

To prevent a title from being added to the toc, give it the `.notoc` CSS class.

> **Tip:** You can use the [markdown-it-attrs](https://github.com/arve0/markdown-it-attrs) plugin to do this in your markdown.

#### `markdown`

This allows you to configure the [markdown-it](https://github.com/markdown-it/markdown-it) markdown-it markdown parser.

It takes a configuration object that allows you to configure the parser in three ways:

 - `extend` the default options passed to the parser
 - Add `plugins` to the parser.
 - `customize` the parser after it was created.

Here's an example that does all three. It uses `extend` to change the highlight function. Uses `plugins` to load the 
[markdown-it-video](https://github.com/CenterForOpenScience/markdown-it-video) plugin,
and uses `customize` to add `onion` as a TLD to linkify. 

```
markdown: {
  extend(config) {
    config.highlight = (code, lang) => {
      return `<pre class="language-${lang}"><code class="language-${lang}">${Prism.highlight(code, Prism.languages[lang] || Prism.languages.markup)}</code></pre>`
    }
  },
  plugins: {
	video: require('markdown-it-video')
  },
  customize(parser) {
    parser.linkify.tlds('onion')
  }
}
```

## Example

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
      markdown: {
        plugins: {
          toc: {
            permalinkClass: 'nuxtent-toc',
            permalinkSymbol: '↗'
          },
          attrs: require('markdown-it-attrs'),
          figures: [require('markdown-it-implicit-figures'), { figcaption: true }],
          video: require('markdown-it-video')
        }
      }
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
   - These are not posts
   - We want to inject `generatedBy` into the frontmatter
   - We want a breadcumbs trail to be generated
   - We want the elements for a table of contents to be generated
   - We want to override some of the settings of the markdown parser:
     - Change the class for anchors
     - Change the symbol used for anchors
     - Load three extra plugins for the markdown parser
   
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

Requests for a blog posts are served by the `blog/_postpost.vue` page.
Inside it, we have this:

```js
  asyncData: async function ({ app, route }) {
    return { post: await app.$content('/en/blog').get(route.path)}
  }
```

Note that what we are fetching from the content-api is `content-group`+`permalink`, like this:

  /content-api/ **section** **permalink**

For example, a blog post in section `blog` with permalink `/blog/hello-world` 
will be fetched in async from `/content-api/blog/blog/hello-world`

## API configuration

Apart from the content, you can (and should) configure how to access the content api
in `nuxtent.config.js`. Here's an example:

```js
    api: {
      baseURL: 'http://localhost:3000',
      browserBaseURL: process.env.FREESEWING_BROWSER_BASE_URL
    },
```

### `baseURL`

The url to the content-api used by node, and by the browser in development.

This is probably going to be `http://localhost:3000`

### `browserBaseURL`

The url to the content-api used by the browser in production.

Something like `https://my-website.com/content-api`

In the example above, we use an environment variable for this to differentiate between development and production environments.

## License

[MIT License](./LICENSE)

Copyright (c) 2017 Nuxt Community
