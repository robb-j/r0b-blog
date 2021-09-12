const { ApiError } = require('./api-error')

function runApp() {
  throw new ApiError(404, 'notFound')

  // or

  // throw ApiError.unauthorized();
}

function main() {
  runApp()
}

main()
