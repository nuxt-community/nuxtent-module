---
title: Writing Your Content
---

#### Page Data

`Nuxtent` processes all content files as data.


Any markdown file that contains a YAML front matter block will be processed by Jekyll as a special file. The front matter must be the first thing in the file and must take the form of valid YAML set between triple-dashed lines. Here is a basic example:




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

<!-- <h1 id="async-components">  Async Components </h1> -->

##### Considerations:

- The markdown file's configuration options, metadata and `content`, are all passed together. So to avoid conflict, keep in mind that the configuration properties are reserved, unless you purposefully are intending to override them via the front-matter.


<h1 name="async-components">  Async Components </h1>
