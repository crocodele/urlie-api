/**
 * DomainCounterService
 *
 * @description :: Helper functions for managing domain counters
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Services
 */

module.exports = {

  /**
  * Get next counter value for domain
  * @param string domain domain name
  * @return Promise
  */
  getNextValue: function(domain) {
    return DomainCounter.getNextValue(domain);
  },

};
