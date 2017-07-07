# Nuxt-Content

`nuxt-content` facilitates the usage of markdown files in content heavy sites.
It does this first, by compiling all the data from markdown files based on configured rules and second, by providing helper methods for dynamically accessing this data inside Nuxt pages.

Best of all, `nuxt-content` is a lightweight abstraction that does as little work as possible. Nuxt is already great, so we only need to add a little bit of sugar on top to handle the content. :)

## Installation

```
npm install nuxt-content

```

Then, under `nuxt.config.js` install the module:

```
modules: [
   '@nuxtjs/content'
 ]
```

## Getting Started

There are two main steps to using `nuxt-content`: 1) configuring how you want your content data compiled and 2) dynamically using the content data inside Nuxt pages.

### Content Configuration

#### Directory Options

All content options can be configured either inside a `nuxt.content.js` file or under the `content` property in `nuxt.config.js`.

*Note: All paths are relative to Nuxt Source Directory.*

- `srcDir`, String that specifies the directory where the content is located. By default, all content is placed in the `/content` directory.
- `routeName`, String that specifies the name of the dynamic page route that serves as the content's page. This is necessary so that the route path can be changed to match the content's permalink configuration.
- `permalink`, String that specifies dynamic url path configuration options. The possible options are `:slug`, `:section`, `:year`, `:month`, `:day`.
- `isPost`, Boolean that specifies whether the content requires a date. The default is true.
- `data`, Object that specifies that additional data that you would like injected into your content's component.
- `dirs`, Array that specifies options for all content under a directory. A 2D array is also allowed to configure multiple content types. These nested configurations will override any global directory options mentioned above.

Here's an example `nuxt.content.js` file:

```js
module.exports = {
 // Global Options
 srcDir: "content" // default
 // Directory Options
 dirs: [
  // content/blog/2013-01-10-HelloWorld.md -> localhost:3000/2013/hello-world
  ["posts", {
    routeName: "post", // pages/_post.vue
    permalink: ':year/:slug',
    data: {
      author: "Alid Castano"
    }
  }],
  // content/projects/NuxtContent.md -> localhost:3000/projects/nuxt-content
  ["projects", {
    routeName: "projects-slug", // pages/projects/_slug.vue
     permalink: "projects/:slug",
    isPost: false
  }]
 ]
}

```

##### Considerations:

- When specifying the `routeName`, you have to mentally serialize the route name based on the route's directory path. As a general rule, just ignore all initial underscores and file extensions, and separate the remaining words by a hypen.
- Since all content route paths will be changed to comply to the content's `permalink`, be extra mindful of how you configure permalinks to avoid conflict. For example, since you can only have one dynamic page per level, both `:year/:slug` and `:section/:slug` conflict. To avoid this, hard code sections whenever possible. The permalinks `someSection/:slug` and `:year/slug` would be preferable.


#### Page Options

By default, page specific data is extracted from the file name, but some options can be overridden via the front-matter of the respective file.

Front Matter Options:
  -  `slug`, String that overrides the content's url identification name.
  - `permalink`, String that overrides the content's entire dynamic url path.

For example, if you wanted to override the page's slug:

```js
// `nuxt.config.js`
content: {
  route: '/blog',
  permalink: 'blog/:year/:slug'
}

// content/2014-05-10-MyFirstPost.md -> localhost:3000/blog/1st
---
permalink: "1st"
---

# Hello World!

```

##### Considerations:

- The markdown file's configuration options, metadata and `content`, are all passed together. So to avoid conflict, keep in mind that the configuration properties are reserved, unless you purposefully are intending to override them via the front-matter.

### Content Usage

`Nuxt-content` merges and compiles all your content's data - the filename, front-matter, and markdown content. You can dynamically request this data inside Nuxt pages using the `$content` helper.

The `$content` helper is injected into the `context.app` property passed to the asyncData method that is available inside each Nuxt page.

`$content` takes as its first argument the name of the registered directory whose files you are requesting. The method fetches all the data from the markdown files inside that directory and returns two methods, `get` and `getAll`, for accessing the requested content.

 `get` takes in the route's path and returns the content of that specific route. `getAll` returns all the content data retrieved from the registered directory.

Here's an example that uses both methods:

```js
// pages/post.vue

export default {
  asyncData ({ app, route }) {
    const posts = app.$content('/posts')
    return {
      currPost: posts.get(route.path)
      posts: posts.getAll()
    }
  },
  render (h) {
    h (
      <div>
        <h3> Article: </h3>
        <section class="post">
          <h1> {{ currPost.title }} </h1>
          <div v-html="currPost.content" />
        </section>
        <h3> See more: </h3>
        <ul>
          <li v-for="post in posts">
            <a href="post.permalink"> {{ post.title }}</a>
          </li>
        </ul>
      </div>
    )
  }
}

```

##### Considerations:

- The markdown file's content is passed as HTML via the `content` property. To access the content inside the component, render it via the `v-html` directive.

### License

MIT
