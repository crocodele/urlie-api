/**
 * ShortUrlController
 *
 * @description :: Server-side logic for managing short URLs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	/**
  * Create short URL for current hostname
  */
  create: function(req, res) {
    var bases = require("bases");
    var NotUniqueError = require("../errors/NotUniqueError");
    var InvalidAttributesError = require("../errors/InvalidAttributesError");

    // Get next counter value for domain
    DomainCounterService.getNextValue(req.host)
    .then(function(counterValue) {
      // Hash current counter value to use as short URL slug
      var hash = bases.toAlphabet(counterValue, sails.config.urlie.alphabet);

      // Construct key
      var key = req.host + ":-" + hash;

      // Create short URL
      return ShortUrlService.createShortUrl(
        hash,
        key,
        req.param("targetUrl"),
        {
          key: req.ip,
          total: 500,
          timeframe: 60 * 60 * 1000,
        }
      )
      .then(function(shortUrl) {
        // Log details for created short URL
        sails.log.debug(
          "Created short URL with key '" + key + "', " +
          "pointing to target URL " + shortUrl.targetUrl
        );

        // Return success message
        return res.json(200, {
          success: true,
          message: "Short URL created successfully",
          data: shortUrl,
        });
      })
      .catch(NotUniqueError, function(error) {
        // Return error message and data
        return res.json(409, {
          success: false,
          message: "Short URL creation failed: Hash is taken",
          data: {
            hash: hash,
          },
          error: error,
        });
      })
      .catch(InvalidAttributesError, function(error) {
        // Return error message and data
        return res.json(400, {
          success: false,
          message: "Short URL creation failed: Invalid attributes given",
          error: error,
        });
      })
      .catch(function(error) {
        return res.json(500, {
          success: false,
          message: "Short URL creation failed: " + error.message,
          error: error,
        });
      });
    })
    .catch(function(error) {
      return res.json(500, {
        success: false,
        message: "Short URL creation failed: " + error.message,
        error: error,
      });
    });
  },

  /**
  * Create short URL with custom slug
  */
  createCustom: function(req, res) {
    var NotUniqueError = require("../errors/NotUniqueError");
    var InvalidAttributesError = require("../errors/InvalidAttributesError");

    // Construct key
    var key = req.host + ":" + req.param("customSlug");

    ShortUrlService.createShortUrl(
      req.param("customSlug"),
      key,
      req.param("targetUrl"),
      {
        key: req.ip,
        total: 500,
        timeframe: 60 * 60 * 1000,
      }
    )
    .then(function(shortUrl) {
      // Log details for created short URL
      sails.log.debug(
        "Created short URL with key '" + key + "', " +
        "pointing to target URL " + shortUrl.targetUrl
      );

      // Return success message
      return res.json(200, {
        success: true,
        message: "Short URL created successfully",
        data: shortUrl,
      });
    })
    .catch(NotUniqueError, function(error) {
      // Return error message and data
      return res.json(409, {
        success: false,
        message: "Short URL creation failed: Hash is taken",
        data: {
          hash: req.param("customSlug"),
        },
        error: error,
      });
    })
    .catch(InvalidAttributesError, function(error) {
      // Return error message and data
      return res.json(400, {
        success: false,
        message: "Short URL creation failed: Invalid attributes given",
        error: error,
      });
    })
    .catch(function(error) {
      return res.json(500, {
        success: false,
        message: "Short URL creation failed: " + error.message,
        error: error,
      });
    });
  },
};
