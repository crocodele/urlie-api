var should = require("should");

describe("DomainCounter", function() {

  describe("#getNextValue('countertest.urlie.fi')", function() {
    it("should return 10000 as first counter value", function (done) {
      DomainCounter.getNextValue("countertest.urlie.fi")
      .then(function(value) {
        value.should.equal(10000);
        done();
      })
      .catch(done);
    });

    it("should return 10001 as next counter value", function(done) {
      DomainCounter.getNextValue("countertest.urlie.fi")
      .then(function(value) {
        value.should.equal(10001);
        done();
      })
      .catch(done);
    });
  });

});
