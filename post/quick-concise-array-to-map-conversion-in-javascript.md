---
title: Quick Array to Map Conversion in JavaScript
date: 2021-02-28T19:50:00.000Z
draft: false
summary: >-
  How to quickly and concisly convert a JavaScript Array into a Map
  to enable efficient lookups.
---

# Quick Array to Map Conversion in JavaScript

## TLDR

```ts
const people = [
  { id: 'geoff', name: 'Geoff' },
  { id: 'helen', name: 'Helen' },
  { id: 'tim', name: 'Tim' }
]

const peopleMap = new Map(people.map(item => [item.id, item]))

console.log(peopleMap.get('tim'))
// { id: 'tim', name: 'Tim' }
```

Converting an array to a map is a useful tool to turn an `O(n)` operation into `O(1)`.
If you're often looking up a value in an array that isn't changing, you can optimise it like this.
Instead of looping through the entire array to find a value, you can look up an item by some key.

> It's worth noting that this **is not** useful if you only have to do a single lookup of the array,
> you should just loop through it in that case.
> If you are often looking up values in the same array, that is when this is beneficial.

## How does it work

[JavaScript's Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
has been around for a while and is designed for situations where an object has dynamic keys.
The constructor takes an `entries` value, which may seem a little strange at first.
This entries value is an array of key-value pairs which it can use to initially fill in the map.

```ts
const entries = [
  ['geoff', { id: 'geoff', name: 'Geoff' }],
  ['helen', { id: 'helen', name: 'Helen' }],
  ['tim', { id: 'tim', name: 'Tim' }]
]
```

Each item is an array where the first subitem is the key and the second is a value.
When passed to the Map constructor, the key will be the index to lookup by and the value is the thing to lookup.

To quickly create these entries, we can use
[Array's map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
method which converts each item of an array into something else, based on a function you provide.
You can use this to easily convert an array of objects into an array of entries.

```ts
const people = [
  { id: 'geoff', name: 'Geoff' },
  { id: 'helen', name: 'Helen' },
  { id: 'tim', name: 'Tim' }
]
const entries = people.map(object => [object.id, object.name])
```

The arrow function passed to `map` takes an object and converts it into an entry
where the key is the object's `id` and the value is the object itself.

Putting it all back together again:

```ts
//
// These are the objects we want to create a map of
//
const people = [
  { id: 'geoff', name: 'Geoff' },
  { id: 'helen', name: 'Helen' },
  { id: 'tim', name: 'Tim' }
]

//
// This creates a map from our array of people
//
const peopleMap = new Map(people.map(item => [item.id, item])

//
// Now we can find Tim
//
console.log(peopleMap.get('tim'))
// outputs: { id: 'tim', name: 'Tim' }
```

Now you have a map which you can quickly and efficiently lookup from.
I've found this especially useful in Vue computed properties.
When you have an array of models that you want to lookup values from,
you can setup a computed property that generates a map.
When the array changes it will automatically recompile the map for you based on the new array.
