var Promise = require("bluebird");
var should = require("should");
var _ = require("lodash");
var NotUniqueError = require("../../../api/errors/NotUniqueError");
var RateLimitError = require("../../../api/errors/RateLimitError");

describe("ShortUrlService", function() {

  describe("#createShortUrl", function() {
    it("should succeed when key and target URL are valid", function() {
      var hash = "abc1";
      var key = "countertest.urlie.fi:" + hash;
      var targetUrl = "http://slashdot.org/";
      ShortUrlService.createShortUrl(hash, key, targetUrl)
      .should.be.fulfilled();
    });

    it("should fail when key is already in use", function(done) {
      var hash = "abc2";
      var key = "countertest.urlie.fi:" + hash;
      var targetUrl = "http://slashdot.org/";
      ShortUrlService.createShortUrl(hash, key, targetUrl)
      .then(function(shortUrl) {
        shortUrl.should.be.an.Object();

        ShortUrlService.createShortUrl(hash, key, targetUrl)
        // Not expected result
        .then(function() {
          done(new Error("Tried to use existing key - and succeeded"));
        })
        // Expected result
        .catch(NotUniqueError, function(error) {
          done();
        })
        // Not expected result
        .catch(done);
      })
      // Not expected result
      .catch(done);
    });

    it("should succeed when key, target URL and rate limit settings are valid", function() {
      var hash = "abc3";
      var key = "countertest.urlie.fi:" + hash;
      var targetUrl = "http://slashdot.org/";
      var rateLimitSettings = {
        key: "65.84.119.35",
        total: 100,
        timeframe: 60 * 1000,
      };
      ShortUrlService.createShortUrl(hash, key, targetUrl, rateLimitSettings)
      .should.be.fulfilled();
    });

    it("should fail when rate limit is exceeded", function(done) {
      var hash = "abc4";
      var key = "countertest.urlie.fi:" + hash;
      var targetUrl = "http://slashdot.org/";
      var rateLimitSettings = {
        key: "131.99.247.68",
        total: 3,
        timeframe: 60 * 1000,
      };
      ShortUrlService.createShortUrl(hash + "-1", key + "-1", targetUrl, rateLimitSettings)
      .then(function(shortUrl) {
        shortUrl.should.be.an.Object();
        shortUrl.targetUrl.should.equal(targetUrl);
        ShortUrlService.createShortUrl(hash + "-2", key + "-2", targetUrl, rateLimitSettings)
        .then(function(shortUrl) {
          shortUrl.should.be.an.Object();
          shortUrl.targetUrl.should.equal(targetUrl);
          ShortUrlService.createShortUrl(hash + "-3", key + "-3", targetUrl, rateLimitSettings)
          .then(function(shortUrl) {
            shortUrl.should.be.an.Object();
            shortUrl.targetUrl.should.equal(targetUrl);
            ShortUrlService.createShortUrl(hash + "-4", key + "-4", targetUrl, rateLimitSettings)
            // Not expected result
            .then(function(shortUrl) {
              done(new Error("Rate limit exceeded - but short URL generation succeeded anyway"));
            })
            // Expected result
            .catch(RateLimitError, function(error) {
              error.message.should.equal("Rate limit exceeded");
              done();
            })
            // Not expected result
            .catch(function(error) {
              done(error);
            });
          })
          .catch(done);
        })
        .catch(done);
      })
      .catch(done);
    });
  });

  describe("#getValidatedUrl", function() {
    it("should accept valid URL https://www.google.com/", function() {
      var testUrl = "https://www.google.com/";
      ShortUrlService.getValidatedUrl(testUrl)
      .should.be.fulfilledWith(testUrl);
    });

    it("should permissively accept twitter.com/about as a URL with protocol missing", function() {
      var testUrl = "twitter.com/about";
      ShortUrlService.getValidatedUrl(testUrl)
      .should.be.fulfilledWith("http://" + testUrl);
    });

    it("should fail on invalid URL thisisnotaurl", function() {
      var testUrl = "thisisnotaurl";
      ShortUrlService.getValidatedUrl(testUrl)
      .should.be.rejectedWith("Invalid URL");
    });

    it("should accept valid URL http://aaa...aaa.com/ with 2000 characters", function() {
      // Construct a URL with 2000 characters
      var testUrl = "http://" + _.repeat("a", 1988) + ".com/";
      testUrl.length.should.equal(2000);
      ShortUrlService.getValidatedUrl(testUrl)
      .should.be.fulfilledWith(testUrl);
    });

    it("should fail on valid URL http://aaa...aaa.com/ with 2001 characters", function() {
      // Construct a URL with 2001 characters
      var testUrl = "http://" + _.repeat("a", 1989) + ".com/";
      testUrl.length.should.be.above(2000);
      ShortUrlService.getValidatedUrl(testUrl)
      .should.be.rejectedWith("URL is too long, maximum URL length is 2000 characters");
    });
  });

});
