class ApiError extends Error {
  static notFound() {
    return new ApiError(404, 'general.notFound').trimStack()
  }
  static unauthorized() {
    return new ApiError(401, 'general.unauthorized').trimStack()
  }

  constructor(status, apiCode) {
    super(`There was an error with your API request: "${apiCode}"`)
    this.name = 'ApiError'
    this.status = status
    this.apiCode = apiCode
    Error.captureStackTrace(this, ApiError)
  }

  trimStack() {
    Error.captureStackTrace(this, ApiError)
    return this
  }
}

module.exports = { ApiError }
