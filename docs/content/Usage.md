---
title: Using Your Compiled Content
---

## Fetching Content

### The `$Content` Method

Nuxtent injects the `$content` helper into Nuxt's `content.app` instance that allow you to dynamically request your content data inside pages.

* `$content`,  Function, that takes as its first argument the name of the registered directory whose content you are requesting. The function fetches all the data from the markdown files inside that directory and returns two methods, `get` and `getAll`, for accessing the requested content.
  * `get`, Function, takes in the route's path and returns the content of that specific route.
  * `getAll` Function, takes no arguments and returns all the content data retrieved from the registered directory.


*Note: You must use Nuxt's `asyncData` or `fetch` methods in order to request content, which are only available inside pages*


### Payload

If you'd like to generate the content for a static site, you must use the [`payload`](https://nuxtjs.org/api/configuration-generate) as backup.

## Rendering Content

### The `<nuxtent-body>` Component

Nuxtent globally registers the `<nuxtent-body>` component so that you can easily register the body of the content file, regardless of whether it was compiled as a `vue component` or `html`.


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
    post: app.$content('/posts').get(route.path) || payload
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
