---
name: My first Project!
---

### Here's my demo:

@[project]()


### Here's the code:

Template:

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
