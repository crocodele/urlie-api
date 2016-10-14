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

    // Get current counter value and increment counter for hostname
    // @todo: Implementation
    var counterValue = 12345;

    // Hash current counter value to use as short URL slug
    var hash = bases.toAlphabet(counterValue, sails.config.urlie.alphabet);

    // Construct key
    var key = req.host + ":-" + hash;

    // Get short URL by key
    ShortUrl.create({
      key: key,
      targetUrl: req.param("targetUrl"),
    })
      .then(function(shortUrl) {
        // Creation failed
        if (!shortUrl) {
          // Return error message
          return res.json(400, {
            success: false,
            message: "Short URL creation failed",
          });
        }

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
      .catch(function(error) {
        // Log error
        sails.log.error(error);

        // Return error message
        return res.json(500, {
          success: false,
          message: "Short URL creation failed",
        });
      });
  },
};
