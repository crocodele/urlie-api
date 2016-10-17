/**
 * InvalidAttributesError
 *
 * @description :: Custom error thrown when model is given invalid attributes
 */

module.exports = function InvalidAttributesError(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message || "";
  this.extra = extra;
}

require("util").inherits(module.exports, Error);
