---
title: Hello World!
---

### Here's my demo:

@[project]()

### Here's the code:

Template:

So it works on client side renderning but not on refresh...

```html
<div>
  <h1> {{ name }}</h1>
  <button @click="someMethod"> Click here! </h1>
</div>
```

Script:

```js
export default {
  props: ['name'],
  methods: {
    someMethod () {
      return this.name
    }
  }
}
```
