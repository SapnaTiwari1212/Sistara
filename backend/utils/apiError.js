/** Error class carrying an HTTP status, understood by the error middleware. */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.isOperational = true
  }
}