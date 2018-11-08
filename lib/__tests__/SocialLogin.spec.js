const SocialLogin = require('../SocialLogin');

describe('Social Login Class', () => {
  it('should expose default options', () => {
    expect(SocialLogin.defaultOptions).toMatchInlineSnapshot(`
Object {
  "ProfileModelConfig": Object {
    "base": "PersistedModel",
    "name": "Profile",
    "properties": Object {
      "provider": Object {
        "required": true,
        "type": "string",
      },
    },
  },
  "UserModelName": "User",
  "session": false,
  "socialLoginProp": "socialLogin",
  "tokenMiddlewareOptions": Object {},
}
`);
  });
});
