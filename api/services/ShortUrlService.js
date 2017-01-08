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
    var NotUniqueError = require("../errors/NotUniqueError");
    var InvalidAttributesError = require("../errors/InvalidAttributesError");

    return new Promise(function(resolve, reject) {
      // Validate target URL
      ShortUrlService.getValidatedUrl(targetUrl)
      .then(function(targetUrl) {
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
              })
              .catch(function(error) {
                // Race condition with identical keys inserted at the same time
                if (_.includes(error.message, "Record does not satisfy unique constraints")) {
                  return reject(new NotUniqueError());
                }

                // Log and return error
                sails.log.error(error);
                return reject(error);
              });
            })
            // Rate limit exceeded
            .catch(function(error) {
              return reject(error);
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
            })
            .catch(function(error) {
              // Race condition with identical keys inserted at the same time
              if (_.includes(error.message, "Record does not satisfy unique constraints")) {
                return reject(new NotUniqueError());
              }

              // Log and return error
              sails.log.error(error);
              return reject(error);
            });
          }
        })
        .catch(function(error) {
          // Log and return error
          sails.log.error(error);
          return reject(error);
        });
      })
      .catch(function(error) {
        // Log and return error
        sails.log.error(error);
        return reject(error);
      });
    });
  },


  /**
  * Validate URL for shortening
  * @param string url URL to validate
  * @return Promise
  */
  getValidatedUrl: function(url) {
    var Promise = require("bluebird");
    var validator = require("validator");
    var InvalidAttributesError = require("../errors/InvalidAttributesError");

    return new Promise(function(resolve, reject) {
      // Prepend http:// if protocol is missing
      if (!_.includes(url, "://")) {
        url = "http://" + url;
      }

      // Maximum URL length is 2000 characters - some browsers, firewalls etc.
      // choke on URLs longer than that
      if (url.length > 2000) {
        return reject(new InvalidAttributesError("URL is too long, maximum URL length is 2000 characters"));
      }

      // Validate URL
      if (!validator.isURL(url, {require_valid_protocol: false})) {
        return reject(new InvalidAttributesError("Invalid URL"));
      }

      // Return validated URL on success
      return resolve(url);
    });
  },

};
