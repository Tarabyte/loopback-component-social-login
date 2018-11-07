const SG = require('strong-globalize');
const path = require('path');
SG.SetRootDir(path.join(__dirname, '..'));

const SocialLogin = require('./SocialLogin');

module.exports = (app, options) => new SocialLogin(app, options);
