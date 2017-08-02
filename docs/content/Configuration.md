---
title: Configuring Your Content
order: 3
---

Nuxtent converts all your content files `json` so that they can be used flexibly within Nuxt pages.

There are two places where you can configure how your content is parsed and compiled: inside the `nuxtent.config.js` file or under the `nuxtent` property inside `nuxt.config.js`. For complex configurations, the preferred approach is placing the configuration under it's own file.

# Content Options

All content options are configured under the `content` property.

Here are the possible options:

- `permalink`, String that specifies dynamic url path parameters. The possible options are `:slug`, `:section`, `:year`, `:month`, `:day`.
- `isPost`, Boolean that specifies whether the content requires a date. The default is true.
- `anchorLevel`, Number that specifies the heading level that you wish to be converted to link anchors for navigation within the content's body. Defaults to 1, so any `H1` in a `md` file will be converted.
- `data`, Object that specifies that additional data that you would like injected into your content's component.
- `routes`, Array that configures the route where you inteded to request content at. Each option is an Object that takes in the route's `path` and `method`. This is required, so that the page's route path can be changed to match the content's permalink configuration and so that, if necessary, the appropriate content data can be generated for static builds.
  - `route.path`, String that specifies page directory where content is being requested.
  - `route.method`, String that specifies the [API request `method`](/guide/usage#fetching-content) used.

Here's an example `nuxt.content.js` file:

```js
module.exports = {
// content/HelloWorld.md --> posts/hello-world
 content: {
   permalink: ':slug',
   isPost: false,
   routes: [
     {
       path: '/posts/_slug',
       method: 'get'
     },
     {
       path: '/archive',
       method: 'getAll'
     }
   ]
 }
}
```

*Note: If you are using Nuxtent for a static site, there is a temporary limitations with using `getAll`. See [here](https://github.com/nuxt-community/nuxtent/issues/22) for more details*

#### Content url path considerations

It is important to notice that the complete content path will be prefixed by the Nuxt page's parent route.

For example:
* In `pages/_posts`, the content path would not be prefixed since it is a top level dynamic route.
* In `pages/guide/_slug`, the content path would be prefixed by '/guide' since it is a nested dynamic route.

Thus, when [fetching content](/usage#fetching-content), you must use Nuxt's `route.path` or `route.params` appropriately to grab the content's permalink.


### Multiple Content Types

You can specifiy multiple content types by passing an array of registered directories and their respective options:

```js
module.exports = {
  content: [
    ["posts", {
      permalink: ':year/:slug',
      routes: [
        {
          path: '/_slug',
          method: 'get'
        }
      ]
    }],
    ["projects", {
      permalink: ":slug",
      isPost: false,
      routes: [
        {
          path: '/projects/_slug',
          method: 'get'
        }
      ]
    }]
  ]
}

```

# API Options

For custom environments, you must configure the `baseURL`, so that the content's `serverMiddleware` API and `axios` requests helpers can be setup appropriately.

- `baseURL`, String that specifies that the site's base url.

*Note: You can use environment variables to dynamically set the base url.*

```js
module.exports = {
 api: {
   baseURL: process.env.NODE_ENV === 'production'
    ? 'http://production-url.com'
    : 'http://localhost:3000'
 }
}

```

# Parser Options

You can also configure additional processing to be used Nuxtent parsers.

Currently, this is only exposed for the `markdown` parser, exposed via `parser.md`.  The options are:

* `Highlight`: Function, passed to the [markdownit](https://github.com/markdown-it/markdown-it) parser to setup your preferred syntax highlighter.
* `Use`: Array, additional plugins to apply to parser.

Here's an example setup:

```js
// nuxtent.config.js
const Prism = require('prismjs')
module.exports = {
  parsers: {
    md: {
      highlight: (code, lang) => {
        return Prism.highlight(code, Prism.languages[lang] || Prism.languages.markup)
      }
    }
  }
}

// nuxt.config.js
module.exports = {
  ...
  css: [
    'prismjs/themes/prism-coy.css'
  ]
}
```

See the [markdown-it](https://github.com/markdown-it/markdown-it) API for more details.
