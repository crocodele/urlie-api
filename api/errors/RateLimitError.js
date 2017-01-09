/**
 * RateLimitError
 *
 * @description :: Custom error thrown when rate limit is exceeded
 */

module.exports = function RateLimitError(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message || "";
  this.extra = extra;
}

require("util").inherits(module.exports, Error);
