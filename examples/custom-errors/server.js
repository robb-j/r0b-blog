const express = require('express')
const { ApiError } = require('./api-error')

const app = express()

// A route which results in an error
app.get('/', (req, res, next) => {
  next(new ApiError(404, 'notFound'))
})

// A route using the static helper
app.get('/feature-a', (req, res, next) => {
  next(ApiError.unauthorized())
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
