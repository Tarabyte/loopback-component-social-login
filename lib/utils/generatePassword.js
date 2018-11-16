const {createHmac, randomBytes} = require('crypto');

module.exports = () => {
  const hmac = createHmac('sha1', 'social-login-component');
  hmac.update(randomBytes(32));

  return hmac.digest('hex');
};
