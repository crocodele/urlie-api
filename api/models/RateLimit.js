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
    * Value is a Redis sorted set with millisecond timestamps
    * as members. Each time an API call is made, the corresponding
    * timestamp is added to the set. This is all very Redis-specific stuff
    * not supported by Waterline, so native Redis calls are used.
    */
  },

  /**
  * Increment hits counter
  * @param string key rate limit key (IP address or user ID)
  * @param int total amount of hits allowed during timeframe
  * @param int timeframeLength length of timeframe in milliseconds
  * @return Promise
  */
  incrementHits: function(key, total, timeframeLength) {
    var microtime = require("microtime");
    var Promise = require("bluebird");
    var RateLimitError = require("../errors/RateLimitError");

    var counterKey = "waterline:ratelimit:" + key;

    // Current time in microseconds
    var now = microtime.now();

    // Start of timeframe in microseconds
    var timeframeStart = now - (timeframeLength * 1000);

    return new Promise(function(resolve, reject) {
      // Waterline doesn't provide atomic operations, so use the native adapter
      RateLimit.native(function(error, collection) {
        // Connection failed
        if (error) {
          return reject(error);
        }

        // Perform multiple operations atomically
        var batch = collection.multi();

        // Step 1: Delete old entries related to given key
        batch.zremrangebyscore(counterKey, "-inf", timeframeStart);

        // Step 2: Count entries related to given key
        batch.zrange(counterKey, 0, -1);

        // Step 3: Add one hit, with timestamp as value
        batch.zadd(counterKey, now, now);

        // Step 4: Update key expiry time to end of timeframe
        batch.expire(counterKey, timeframeLength);

        // Run actions
        batch.exec(function(error, results) {
          // Query failed
          if (error) {
            return reject(error);
          }

          // Resolve hit count from step 2, including this call
          var hits = results[1].length + 1;

          // Return error if limit has been exceeded
          if (hits > total) {
            return reject(new RateLimitError("Rate limit exceeded"));
          }

          // Success
          return resolve({
            total: total,
            hits: hits,
            remaining: total - hits,
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
      // Waterline doesn't provide atomic operations, so use the native adapter
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
