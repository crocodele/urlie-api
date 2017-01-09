var sails = require("sails");

// Prepare for testing
before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift
  this.timeout(5000);

  // Start server
  sails.lift(
    {
      environment: "test",
      port: 9999,
      hostName: "localhost:9999",
      connections: {
        // Redis
        redis: {
          adapter: "sails-redis",
          port: 6379,
          host: "localhost",
          password: null,
          database: 1,
        },
      },
      log: {
        level: "warn",
      },
      models: {
        migrate: "drop",
      },
    },
    function(error, server) {
      // Quit on error
      if (error) {
        return done(error);
      }

      // Trust proxy to allow IP address spoofing
      sails.hooks.http.app.set("trust proxy", true);

      // Start with empty database
      DomainCounter.native(function(error, collection) {
        if (error) {
          return done(error);
        }

        collection.flushdb(function(error, outcome) {
          if (error || !outcome) {
            return done(error);
          }

          // @TODO: Add fixtures, if necessary

          // Success
          done(error, sails);
        });
      });
    }
  );
});

// Clean up after testing
after(function(done) {
  console.log();
  sails.lower(done);
});
