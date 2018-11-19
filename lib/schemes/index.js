const oauth20 = require('./OAuth2.0');

const notImplemented = () => {
  throw new Error('The scheme is not implemented yet.');
};

module.exports = {
  'OAuth2.0': oauth20,
  OAuth1: notImplemented,
  Local: notImplemented
};
