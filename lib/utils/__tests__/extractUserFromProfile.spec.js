const extractUserFromProfile = require('../extractUserFromProfile');
const {__setPassword, __resetPassword} = require('../generatePassword');

jest.mock('../generatePassword.js', () => {
  let password = 'password';
  const generate = () => password;

  generate.__setPassword = pwd => (password = pwd);
  generate.__resetPassword = () => (password = 'password');

  return generate;
});

describe('extractUserFromProfile', () => {
  beforeEach(() => {
    __resetPassword();
  });

  it('should generate password', () => {
    __setPassword('test');

    const user = extractUserFromProfile({});

    expect(user.password).toBe('test');
  });

  it('should use username', () => {
    const user = extractUserFromProfile(
      {
        username: 'test-username'
      },
      'test-provider'
    );

    expect(user.username).toBe('test-username');
  });

  it('should generate username by provider and id', () => {
    const user = extractUserFromProfile(
      {
        id: 'test-id'
      },
      'test-provider'
    );

    expect(user.username).toBe('test-provider.test-id');
  });

  it('should generate email', () => {
    const user = extractUserFromProfile(
      {
        id: 'test-id'
      },
      'test-provider'
    );

    expect(user.email).toMatchInlineSnapshot(
      `"test-provider.test-id@generated.email.com"`
    );
  });

  it('should use first email if emails is not empty', () => {
    const user = extractUserFromProfile(
      {
        id: 'test-id',
        emails: [{value: 'test@test.test'}]
      },
      'test-provider'
    );

    expect(user.email).toBe('test@test.test');
  });
});
