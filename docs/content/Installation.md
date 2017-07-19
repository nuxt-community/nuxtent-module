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
