---
title: Installation
order: 1
---

### Quick Start

If you're starting a new site, you can use the `nuxtent` starter template.

```bash
$ vue init nuxt-community/nuxtent-starter my-site
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

*Note: @nuxtjs/axios` is a peer dependencies so you will need to have it installed, as well.*
