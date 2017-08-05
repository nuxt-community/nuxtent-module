---
title: Using Your Compiled Content
order: 5
---

# Fetching Content

### The `$Content` Method

Nuxtent injects the `$content` helper into Nuxt's `content.app` instance that allow you to dynamically request your content data inside pages.

* `$content`,  Function, that takes as its first argument the name of the registered directory whose content you are requesting. The function fetches all the data from the markdown files inside that directory and returns the request modifiers and methods below for accessing the desired content.
  * `query`, Object that accepts query options to add to the content's request and returns the `$content` object. Here are the options:
    * `exclude`: String or Array of page properties that are not needed and should be excluded from request.
  * `get`, Function, takes in the content's permalink and returns a promise that contains the content of that specific route.
  * `getOnly`, Function that takes in the start index and end index as arguments and returns a promise of all the pages within that the range. All content file ordering is reserved, so if it the content is dated, it's sorted from latest to oldest.
  * `getAll` Function, that returns promise of all the content data retrieved from the registered directory.

*Note: You must use Nuxt's `asyncData` or `fetch` methods in order to request content, which are only available inside pages*

Here's an usage of the `app.$content` helper inside a Nuxt page:

```js
export default {
  async asyncData ({ app }) {
    return {
      contentPreview: await app.$content('/')
      .query({ exclude: ['attributes', 'body'] })
      .getAll()
    }
  }
}
```

# Navigating Content

Each page is passed its `permalink` and `anchors` as data, which you can use to automatically create navigation to all content pages.

The `anchors` property is an 2D array, where for each item the first index, `anchor[0]` is the link attribute and the second index, `anchor[1]`, is the heading's text.

# Rendering Content

### The `<nuxtent-body>` Component

Nuxtent globally registers the `<nuxtent-body>` component so that you can easily register the body of the content file, regardless of whether it was compiled as a `vue component` or `html`.

*Note: There is currently a bug rendering HTML using JSX, which is how `nuxtent-body` does it. See [here](https://github.com/nuxt-community/nuxtent/issues/15) for workarounds.*

## Usage Example

Here's an example that uses the `$content` method and the `<nuxtent-body />` component together:

### Markdown

```
---
title: Is Nuxtent better than Jekyll?
---

Well, it uses Vue and Nuxt....

```


### Template

```html
<h1> {{ post.title }} </h1>
<nuxtent-body :body="post.body" />

```

### Script

```js
async asyncData ({ app, route, payload }) {
  return {
    post: await app.$content('/posts').get(route.path) || payload
  }
}
```

### Result

```html
<div>
  <h1> Is Nuxtent better than Jekyll? </h1>
  <di>
    <p> Well, it uses Vue and Nuxt.... </p>
  </div>
</div>
```
