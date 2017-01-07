var request = require("supertest");

describe("ShortUrlController", function() {

  describe("#create", function() {
    it("should succeed on anonymous POST request with valid parameters", function (done) {
      var targetUrl = "http://slashdot.org/";
      request(sails.hooks.http.app)
        .post("/urls/shorten")
        .send({
          targetUrl: targetUrl,
        })
        .expect(200)
        .expect(function(res) {
          if (res.body.success !== true) {
            throw new Error("Unexpected success value");
          }
          if (res.body.message !== "Short URL created successfully") {
            throw new Error("Unexpected message value");
          }
          if (!("data" in res.body)) {
            throw new Error("Missing data value");
          }
        })
        .end(done);
    });
  });

  describe("#createCustom", function() {
    it("should succeed on anonymous POST request with valid parameters", function (done) {
      var customSlug = "customSlugSlashdot";
      var targetUrl = "http://slashdot.org/";
      request(sails.hooks.http.app)
        .post("/urls/shorten/" + customSlug)
        .send({
          targetUrl: targetUrl,
        })
        .expect(200)
        .expect(function(res) {
          if (res.body.success !== true) {
            throw new Error("Unexpected success value");
          }
          if (res.body.message !== "Short URL created successfully") {
            throw new Error("Unexpected message value");
          }
          if (!("data" in res.body)) {
            throw new Error("Missing data value");
          }
          if (res.body.data.key !== "127.0.0.1:customSlugSlashdot") {
            throw new Error("Unexpected short URL key");
          }
        })
        .end(done);
    });
  });

});