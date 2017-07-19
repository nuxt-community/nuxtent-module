---
title: Configuring Your Content
---

Nuxtent converts all your content files `json` so that they can be used flexibly within Nuxt pages.

There are two places where you can configure how your content is parsed and compiled: inside the `nuxtent.config.js` file or under the `nuxtent` property inside `nuxt.config.js`. For complex configurations, the preferred approach is placing the configuration under it's own file.

# Content Options

All content options are configured under the `content` property.

Here are the possible options:

- `routeName`, String that specifies the name of the dynamic page route that you intend to use as the content's page. This is required, so that the page's route path can be changed to match the content's permalink configuration. (*Note: See below for information on Nuxt's route naming convention.*).
- `permalink`, String that specifies dynamic url path parameters. The possible options are `:slug`, `:section`, `:year`, `:month`, `:day`
- `isPost`, Boolean that specifies whether the content requires a date. The default is true.
- `data`, Object that specifies that additional data that you would like injected into your content's component.


*Note: All paths are relative to Nuxt root directory.*

Here's an example `nuxt.content.js` file:

```js
module.exports = {
 content: {
   routeName: 'index-slug', // pages/index/_slug.vue
   permalink: ':slug',   // content/HelloWorld.md -> /hello-world
   isPost: false
 }
}

```

#### Nuxt Route Naming Conventions

When specifying the routeName, you have to mentally serialize the name based on the route's directory path. As a general rule, just ignore all initial `underscores` and file `extensions`, and separate any remaining words by a `hypen`.

Some examples:
- `pages/_article` -> `article`
- `pages/_blog/_post` -> `blog-post`
- `pages/projects/_name` -> `projects-name`

## Multiple Content Types

You can specifiy multiple content types by passing an array of registered directories and their respective options:

```js
module.exports = {
  content: {
    ["posts", {
      routeName: "post", // pages/_post.vue
      permalink: ':year/:slug', // content/posts/2013-01-10-1st.md -> /2013/1st
      data: {
        author: "Alid Castano"
      }
    }],
    ["projects", {
      routeName: "projects-slug", // pages/projects/_slug.vue
      permalink: "projects/:slug", // content/projects/Nuxtent.md - /projects/nuxtent
      isPost: false
    }]
   ]
  }
}

```

#### Permalink Configuration Warning

You can only have one dynamic page per route level, so you have to be extra mindful of how you configure multiple directories in order to avoid conflict. For example: having both `:year/:slug` and `:section/:slug` would cause conflict and as only one page route would get matched. To avoid this, as a general rule hard code sections whenever possible. The example above, for example can be easily replaced with `someSection/:slug` and `:year/slug`, instead.

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
  parser: {
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
