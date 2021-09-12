---
title: Creating custom JavaScript errors
date: 2021-09-12
draft: true
summary: >
  Custom errors are a powerful tool in JavaScript. Here's how to create them with modern ES classes and static methods.
---

Creating custom errors in JavaScript can be very useful. If you want to handle those errors in a `catch` block then you can use the `instanceof` operator to check for that specific error. And with TypeScript you can then safely use the fields and methods on your custom error.

Another benefit of custom errors is that you can provide your own constructor which lets you pass more information to the error. Which is information you can use in an error handler.

Custom JavaScript errors are almost as simple as creating an `Error` subclass, but there are two things you can do to make them even more useful.

## Set the name

The first thing to enhance errors is to set `this.name` inside the constructor. This means your error name will appear in stack traces rather than the generic `Error:`.

## Re-capture the stack trace

An unfortunate side-effect of creating a custom error is that your custom constructor will appear in the stack trace. This is because your `super` call is technically creating the error and the JavaScript VM records that in the generated stack trace. This isn't useful and makes stack traces messier.

Removing this makes it easier to get to the code that's thrown the error. You can do this with the `Error.captureStackTrace` static method.

## An example

To demonstrate this, let's create a custom error that captures extra information for a http API, so we can throw a desired http status and an error identifier.

```js
class ApiError extends Error {
  constructor(status, apiCode) {
    super(`There was an error with your API request: "${apiCode}"`)
    this.name = 'ApiError'
    this.status = status
    this.apiCode = apiCode
    Error.captureStackTrace(this, ApiError)
  }
}
```

That's all you need, you could use it like this:

```js
throw new ApiError(404, 'notFound')

// or

throw new ApiError(400, 'login.emailNotProvided')
```

and this will produce a stack trace like this:

```
/◦◦◦/custom-errors/main.js:4
  throw new ApiError(404, "notFound");
  ^

ApiError: There was an error with your API request: "notFound"
    at runApp (/◦◦◦/custom-errors/main.js:4:9)
    at main (/◦◦◦/custom-errors/main.js:12:3)
    at Object.<anonymous> (/◦◦◦/custom-errors/main.js:15:1)
    ◦◦◦ {
  status: 404,
  apiCode: 'notFound'
}
```

> See [examples/custom-errors](https://github.com/robb-j/r0b-blog/tree/master/examples/custom-errors) for the exact source code.

The output shows that it has namespaced the error with `ApiError:` which is from us setting `this.name`.
The first line of the stack trace is not **ApiError**'s constructor but `runApp` which was the method which threw the error.
Because of this, it also shows you the exact that created the error in the code sample.

You can also see that `status` and `apiCode` have been stored on the error.

## Catching errors

To complete this post, here's an example of catching an **ApiError** and using the extra fields.

```js
const express = require('express')
const app = express()

// From above
class ApiError extends Error {
  /* ... */
}

// A route which results in an error
app.get('/', (req, res, next) => {
  next(new ApiError(404, 'notFound'))
})

// An Express error handler, more info at:
// http://expressjs.com/en/guide/error-handling.html
app.use((error, req, res, next) => {
  console.error('Handled error', error)

  if (error instanceof ApiError) {
    res.status(error.status).send({ apiCode: error.apiCode })
  } else {
    res.status(500).send({ apiCode: 'unknownError' })
  }
})

app.listen(3000)
```

This shows throwing an **ApiError** in an ExpressJs context and handling it with an error middleware.
It checks for an **ApiError** with the `instanceof` operator, and then safely uses the fields on it to generate a http response.
The logic also nicely allows a generic http 500 error to be sent when unknown errors are thrown.

## Bonus: static methods

When using custom errors another pattern I've used is to add static methods to easily create common errors. The does bring back the stack trace issue, so another `Error.captureStackTrace` is needed.

To demonstrate this, lets add some common errors to **ApiError**:

```js
class ApiError extends Error {
  static notFound() {
    return new ApiError(404, 'general.notFound').trimStack()
  }
  static unauthorized() {
    return new ApiError(401, 'general.unauthorized').trimStack()
  }

  // Same as above
  constructor(/* ... */) {
    /* ... */
  }

  trimStack() {
    Error.captureStackTrace(this, ApiError)
    return this
  }
}
```

I found the utility function `trimStack` helps keeps these static methods easier to read and understand.

Now you can quickly create common errors with `throw ApiError.notFound()`, which is easier to read and hopefully leads to less mistakes. For the full source code see See [examples/custom-errors](https://github.com/robb-j/r0b-blog/tree/master/examples/custom-errors).
