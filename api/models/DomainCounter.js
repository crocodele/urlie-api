/**
 * DomainCounter.js
 *
 * @description :: Domain-specific short URL counter
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    /**
    * Domain (hostname)
    */
    domain: {
      type: "string",
      primaryKey: true,
      required: true,
      unique: true,
    },

    /**
    * Counter value
    */
    value: {
      type: "integer",
      required: true,
      notNull: true,
    },
  },

  /**
  * Get the next counter value for domain
  * @param string domain domain name
  * @return Promise
  */
  getNextValue: function(domain) {
    var Promise = require("bluebird");

    var counterKey = "waterline:domaincounter:" + domain;
    var minimumValue = 10000;

    return new Promise(function(resolve, reject) {
      // Waterline doesn't provide the INCR command, so use the native adapter
      DomainCounter.native(function(error, collection) {
        // Connection failed
        if (error) {
          return reject(error);
        }

        // Increment counter for domain
        collection.incr(counterKey, function(error, value) {
          // Query failed
          if (error) {
            return reject(error);
          }

          // Small values lead to weird-looking one- or two-character hashes,
          // so force a minimum counter value
          if (value < minimumValue) {
            collection.set(counterKey, minimumValue, function(error, result) {
              // Query failed
              if (error) {
                return reject(error);
              }

              // Success
              return resolve(minimumValue);
            });
          }
          // Value is good
          else {
            return resolve(parseInt(value));
          }
        });
      });
    });
  },

};
