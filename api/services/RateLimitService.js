/**
 * RateLimitService
 *
 * @description :: Helper functions for managing rate limiting
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Services
 */

module.exports = {

  /**
  * Increment rate limit hits counter
  * @param string key rate limit key (IP address or user ID)
  * @param int total total amount of requests allowed in timeframe
  * @param int timeframe size of timeframe in milliseconds
  * @return Promise
  */
  incrementHits: function(key, total, timeframe) {
    return RateLimit.incrementHits(key, total, timeframe);
  },

  /**
  * Reset rate limit hits counter
  * @param string key rate limit key (IP address or user ID)
  * @return Promise
  */
  resetHits: function(key) {
    return RateLimit.resetHits(key);
  },

};
