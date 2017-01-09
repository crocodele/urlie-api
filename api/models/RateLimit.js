/**
 * RateLimit.js
 *
 * @description :: Rate limit by IP address or API user
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    /**
    * Key (user ID or IP address)
    */
    key: {
      type: "string",
      primaryKey: true,
      required: true,
      unique: true,
    },

    /**
    * Value
    * - int total: total hits allowed during timeframe
    * - int hits: hits made so far during timeframe
    * - date reset: end of timeframe
    */
    value: {
      type: "json",
      required: true,
      notNull: true,
    },
  },

  /**
  * Increment hits counter
  * @param string key rate limit key (IP address or user ID)
  * @return Promise
  */
  incrementHits: function(key, total, timeframeLength) {
    var Promise = require("bluebird");
    var RateLimitError = require("../errors/RateLimitError");

    var counterKey = "waterline:ratelimit:" + key;
    var now = Date.now();

    return new Promise(function(resolve, reject) {
      // Waterline doesn't provide the PX option, so use the native adapter
      RateLimit.native(function(error, collection) {
        // Connection failed
        if (error) {
          return reject(error);
        }

        collection.get(counterKey, function(error, value) {
          // Set to defaults if no previous record is found
          value = value && JSON.parse(value) || {
            total: total,
            hits: 0,
            reset: now + timeframeLength,
          };

          // Reset counter if we're past timeframe already
          if (now > value.reset) {
            value.reset = now + timeframeLength;
            value.hits = 0;
          }
          // Limit is exceeded
          else if (value.hits >= value.total) {
            return reject(new RateLimitError("Rate limit exceeded"));
          }

          // Increment hits
          ++value.hits;

          // Update rate limit values
          collection.set(counterKey, JSON.stringify(value), "PX", timeframeLength, function(error) {
            // Query failed
            if (error) {
              return reject(error);
            }

            // Success
            return resolve({
              total: value.total,
              hits: value.hits,
              reset: value.reset,
              remaining: value.total - value.hits,
            });
          });
        });
      });
    });
  },

  /**
  * Reset hits counter
  * @param string key rate limit key (IP address or user ID)
  * @return Promise
  */
  resetHits: function(key) {
    var Promise = require("bluebird");

    var counterKey = "waterline:ratelimit:" + key;

    return new Promise(function(resolve, reject) {
      // Waterline doesn't provide the INCR command, so use the native adapter
      RateLimit.native(function(error, collection) {
        // Connection failed
        if (error) {
          return reject(error);
        }

        collection.del(counterKey, function(error, value) {
          // Query failed
          if (error) {
            return reject(error);
          }

          // Success
          return resolve(parseInt(value));
        });
      });
    });
  },
};
