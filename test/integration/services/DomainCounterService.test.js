var should = require("should");

describe("DomainCounterService", function() {

  describe("#getNextValue", function() {
    it("should return 10000 as first counter value", function () {
      var domain = "countertest.urlie.fi";
      DomainCounterService.getNextValue(domain)
      .should.be.fulfilledWith(10000);
    });

    it("should return 10001 as next counter value", function() {
      var domain = "countertest.urlie.fi";
      DomainCounterService.getNextValue(domain)
      .should.be.fulfilledWith(10001);
    });

    it("should affect only the given domain", function(done) {
      var domain1 = "first.urlie.fi";
      var domain2 = "second.urlie.fi";
      DomainCounterService.getNextValue(domain1)
      .then(function(domain1Counter) {
        domain1Counter.should.equal(10000);
        DomainCounterService.getNextValue(domain2)
        .then(function(domain2Counter) {
          domain2Counter.should.equal(10000);
          DomainCounterService.getNextValue(domain1)
          .then(function(domain1Counter) {
            domain1Counter.should.equal(10001);
            DomainCounterService.getNextValue(domain2)
            .then(function(domain2Counter) {
              domain2Counter.should.equal(10001);
              done();
            })
            .catch(done);
          })
          .catch(done);
        })
        .catch(done);
      })
      .catch(done);
    });
  });

});
