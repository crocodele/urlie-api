/**
 * ShortUrlService
 *
 * @description :: Helper functions for managing short URLs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Services
 */

module.exports = {

  /**
  * Create new short URL
  * @param string hash short URL hash to create
  * @param string key short URL database key
  * @param string targetUrl target URL
  * @param object rateLimitSettings optional rate limit settings
  * @return Promise
  */
  createShortUrl: function(hash, key, targetUrl, rateLimitSettings) {
    var Promise = require("bluebird");

    return new Promise(function(resolve, reject) {
      // Make sure hash doesn't exist
      ShortUrl.findOne({key: key})
      .then(function(existingShortUrl) {
        // Hash is taken, return error
        if (existingShortUrl) {
          return reject(new NotUniqueError());
        }

        // Check rate limit
        if (rateLimitSettings) {
          RateLimitService.incrementHits(rateLimitSettings.key, rateLimitSettings.total, rateLimitSettings.timeframe)
          .then(function(requestsMade) {
            // Try to add new short URL to database
            ShortUrl.create({
              key: key,
              targetUrl: targetUrl,
            })
            .then(function(shortUrl) {
              // Creation failed, return error
              if (!shortUrl) {
                return reject(new InvalidAttributesError());
              }

              // Success
              return resolve(shortUrl);
            });
          });
        }
        else
        {
          // Try to add new short URL to database
          ShortUrl.create({
            key: key,
            targetUrl: targetUrl,
          })
          .then(function(shortUrl) {
            // Creation failed, return error
            if (!shortUrl) {
              return reject(new InvalidAttributesError());
            }

            // Success
            return resolve(shortUrl);
          });
        }
      })
      .catch(function(error) {
        // Log and return error
        sails.log.error(error);
        return reject(error);
      });
    });
  },

};
