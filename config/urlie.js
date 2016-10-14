/**
* Custom application settings
*/

var bases = require("bases");

// Human input -friendly alphabets that may be used in hash generation
var availableAlphabets = {
  // No numbers, no i, o or lowercase l
  DEFAULT: "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ",

  // Flickr's base58 alphabet, see https://github.com/aseemk/bases.js
  FLICKR: bases.KNOWN_ALPHABETS[58],

  // Douglas Crockford's base32 alphabet, see https://github.com/aseemk/bases.js
  CROCKFORD: bases.KNOWN_ALPHABETS[32],
};

module.exports.urlie = {

  // List of available alphabets
  availableAlphabets: availableAlphabets,

  // Used alphabet
  alphabet: availableAlphabets.DEFAULT,

};
