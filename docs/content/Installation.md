---
title: Installation
---

### Quick Start

If you're starting a new site, you can use the `nuxtent` starter template.

```bash
$ vue init nuxt-community/content-template my-site
$ cd my-site
# install dependencies
$ npm install # Or yarn install
```

### Module Installation

Install `nuxtent` via `npm` or `yarn`.

Then, register the module inside `nuxt.config.js`:

```js
module.exports = {
  modules: [
    'nuxtent'
  ]
}
```

*Note: `vue-loader` and `@nuxtjs/axios` are peer dependencies and you will need to have them installed, as well.*

### Module Options

You can also pass additional options to the `nuxtent` upon registration:

* `Highlight`: Function, passed to the [markdownit](https://github.com/markdown-it/markdown-it) parser to setup your preferred syntax highlighter.


Here's an example setup:

```js
const Prism = require('prismjs')
modules: [
  ['nuxtent', {
    highlight: (code, lang) => {
      return Prism.highlight(code, Prism.languages[lang] || Prism.languages.markup)
    }
  }]
],
css: [
  'prismjs/themes/prism-coy.css'
]

```
