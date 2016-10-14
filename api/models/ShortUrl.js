/**
 * ShortUrl.js
 *
 * @description :: Short URL with hash and target URL
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    /**
    * Key consists of hostname:hash, e.g. urlie.fi:nRza
    */
    key: {
      type: "string",
      primaryKey: true,
      required: true,
      unique: true,
    },

    /**
    * Target URL (long URL)
    */
    targetUrl: {
      type: "string",
      required: true,
      notNull: true,
      url: true,
    },

    /**
    * Creation timestamp
    */
    createdAt: {
      type: "datetime",
      defaultsTo: function() { return new Date(); },
    },
  }
};
