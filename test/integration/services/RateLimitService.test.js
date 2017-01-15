var should = require("should");

describe("RateLimitService", function() {

  describe("#incrementHits", function() {
    it("should increment hit counter to 1 on first request", function(done) {
      var key = "11.112.32.242";
      var maxRequests = 100;
      var timeframe = 60 * 1000;
      RateLimitService.incrementHits(key, maxRequests, timeframe)
      .then(function(result) {
        result.should.be.an.Object();
        result.total.should.equal(100);
        result.hits.should.equal(1);
        result.remaining.should.equal(99);
        done();
      })
      .catch(done);
    });

    it("should increment hit counter to 2 after two requests", function(done) {
      var key = "84.119.122.63";
      var maxRequests = 100;
      var timeframe = 60 * 1000;
      RateLimitService.incrementHits(key, maxRequests, timeframe)
      .then(function(firstResult) {
        RateLimitService.incrementHits(key, maxRequests, timeframe)
        .then(function(secondResult) {
          secondResult.should.be.an.Object();
          secondResult.total.should.equal(100);
          secondResult.hits.should.equal(2);
          secondResult.remaining.should.equal(98);
          done();
        })
        .catch(done);
      })
      .catch(done);
    });

    it("should fail when rate limit is exceeded", function(done) {
      var key = "56.106.21.248";
      var maxRequests = 3;
      var timeframe = 60 * 1000;
      RateLimitService.incrementHits(key, maxRequests, timeframe)
      .then(function(result) {
        result.should.be.an.Object();
        result.remaining.should.equal(2);
        RateLimitService.incrementHits(key, maxRequests, timeframe)
        .then(function(result) {
          result.should.be.an.Object();
          result.remaining.should.equal(1);
          RateLimitService.incrementHits(key, maxRequests, timeframe)
          .then(function(result) {
            result.should.be.an.Object();
            result.remaining.should.equal(0);
            RateLimitService.incrementHits(key, maxRequests, timeframe)
            // Not expected result
            .then(function(result) {
              done(new Error("Rate limit exceeded - but hit counter got incremented anyway"));
            })
            // Expected result
            .catch(function(error) {
              error.message.should.equal("Rate limit exceeded");
              done();
            });
          })
          .catch(done);
        })
        .catch(done);
      })
      .catch(done);
    });

    it("should reset the hit counter when rate limit window has passed", function(done) {
      var key = "91.223.187.39";
      var maxRequests = 3;
      var timeframe = 3 * 1000;
      RateLimitService.incrementHits(key, maxRequests, timeframe)
      .then(function(initialStatus) {
        initialStatus.should.be.an.Object();
        initialStatus.total.should.equal(3);
        initialStatus.hits.should.equal(1);
        initialStatus.remaining.should.equal(2);
        setTimeout(function() {
          RateLimitService.incrementHits(key, maxRequests, timeframe)
          .then(function(finalStatus) {
            finalStatus.should.be.an.Object();
            finalStatus.total.should.equal(3);
            finalStatus.hits.should.equal(1);
            finalStatus.remaining.should.equal(2);
            done();
          })
          .catch(done);
        }, 3500);
      })
      .catch(done);
    });
  });

  describe("#resetHits", function() {
    it("should reset hit counter when there has been requests", function(done) {
      var key = "112.155.211.78";
      var maxRequests = 100;
      var timeframe = 60 * 1000;
      RateLimitService.incrementHits(key, maxRequests, timeframe)
      .then(function() {
        RateLimitService.resetHits(key)
        .then(function(deletedAmount) {
          deletedAmount.should.equal(1);
          done();
        })
        .catch(done);
      })
      .catch(done);
    });

    it("should reset hit counter even though there has not been requests", function() {
      var key = "13.25.185.42";
      var maxRequests = 100;
      var timeframe = 60 * 1000;
      RateLimitService.resetHits(key)
      .should.be.fulfilledWith(0);
    });
  });

});
