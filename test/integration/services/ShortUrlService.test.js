var should = require("should");
var _ = require("lodash");

describe("ShortUrlService", function() {

  describe("#getValidatedUrl", function() {
    it("should accept valid URL https://www.google.com/", function () {
      var testUrl = "https://www.google.com/";
      return ShortUrlService.getValidatedUrl(testUrl)
      .should.be.fulfilledWith(testUrl);
    });

    it("should permissively accept twitter.com/about as a URL with protocol missing", function() {
      var testUrl = "twitter.com/about";
      return ShortUrlService.getValidatedUrl(testUrl)
      .should.be.fulfilledWith("http://" + testUrl);
    });

    it("should fail on invalid URL thisisnotaurl", function() {
      var testUrl = "thisisnotaurl";
      return ShortUrlService.getValidatedUrl(testUrl)
      .should.be.rejectedWith("Invalid URL");
    });

    it("should accept valid URL http://aaa...aaa.com/ with 2000 characters", function() {
      // Construct a URL with 2000 characters
      var testUrl = "http://" + _.repeat("a", 1988) + ".com/";
      testUrl.length.should.equal(2000);

      return ShortUrlService.getValidatedUrl(testUrl)
      .should.be.fulfilledWith(testUrl);
    });

    it("should fail on valid URL http://aaa...aaa.com/ with 2001 characters", function() {
      // Construct a URL with 2001 characters
      var testUrl = "http://" + _.repeat("a", 1989) + ".com/";
      testUrl.length.should.be.above(2000);

      return ShortUrlService.getValidatedUrl(testUrl)
      .should.be.rejectedWith("URL is too long, maximum URL length is 2000 characters");
    });
  });

});
