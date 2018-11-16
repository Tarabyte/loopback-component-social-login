const generatePassword = require('./generatePassword');
const extract = require('./extract');

module.exports = (profile, provider) => {
  const username = profile.username || `${provider}.${profile.id}`;

  return {
    password: generatePassword(),
    username,
    email: extract(
      profile,
      'emails.0.value',
      () => `${username}@generated.email.com`
    )
  };
};
