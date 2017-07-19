---
title: Configuring Your Content
---

There are to places where you can configure your content: inside the `nuxt.content.js` file or under the `content` property inside `nuxt.config.js`. For complex configurations, the preferred approach is placing the configuration under it's own file.

### Content Options

- `srcDir`, String that specifies the directory where the content is located. By default, all content is placed in the `/content` directory.
- `routeName`, String that specifies the name of the name of the dynamic page route that serves as the content's page. This is necessary so that the route path can be changed to match the content's permalink configuration. (*Note: The route name is based on the convention Nuxt uses when creating and naming routes; see below for more information.*).
- `permalink`, String that specifies dynamic url path configuration options. The possible options are `:slug`, `:section`, `:year`, `:month`, `:day`.
- `isPost`, Boolean that specifies whether the content requires a date. The default is true.
- `data`, Object that specifies that additional data that you would like injected into your content's component.
- `dirs`, Array that specifies nested options for all content under the registered directory. A 2D array is also allowed to configure multiple content types. These nested configurations will override any global options mentioned above, and is the prefered way of configuring your data if you have multiple content types.

*Note: All paths are relative to Nuxt root directory.*

Here's an example `nuxt.content.js` file:

```js
module.exports = {
  // Global Options
  isPost: false,
 // Directory Options
 dirs: [
  // content/blog/2013-01-10-HelloWorld.md -> localhost:3000/2013/hello-world
  ["posts", {
    routeName: "post", // pages/_post.vue
    permalink: ':year/:slug',
    isPost: true
    data: {
      author: "Alid Castano"
    }
  }],
  // content/projects/NuxtContent.md -> localhost:3000/projects/nuxt-content
  ["projects", {
    routeName: "projects-slug", // pages/projects/_slug.vue
     permalink: "projects/:slug"
  }]
 ]
}

```

#### Considerations:

- When specifying the routeName, you have to mentally serialize the name to match Nuxt's conventions, based on the route's directory path. As a general rule, just ignore all initial underscores and file extensions, and separate any remaining words by a `hypen`.
- Since all content route path will be changed to comply to the content's `permalink` configuration, you have to be extra mindful of how you configure different directories in order to avoid conflict. For example, since you can only have one dynamic page per route level, having both `:year/:slug` and `:section/:slug` would cause conflict. To avoid this, as a general rule hard code sections whenever possible, e.g. do `someSection/:slug` and `:year/slug`, instead.
