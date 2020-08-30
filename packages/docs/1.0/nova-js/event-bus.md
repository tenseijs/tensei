# Event Bus

Nova comes with a built-in event bus to help facilitate cross-component communication inside the single-page app. Your custom tools, cards, and fields can take advantage of the event bus to listen and respond to these events.

For example, imagine you wanted a slug field to be updated with the value of a text field when the user types into it:

```js
// In your TextField component
export default {
  methods: {
    handleKeydown(event) {
      Nova.$emit('value-updated', {
        value: event.target.value
      })
    }
  }
}

// Listen for the event inside your SlugField component's `mounted` lifecycle method
export default {
  mounted() {
    Nova.$on('value-updated', ({value}) => {
      this.value = slug(value)
    })
  },
};
```

## `$emit`

## `$on`

## `$once`

## `$off`
