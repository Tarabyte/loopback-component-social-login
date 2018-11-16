const SocialLogin = require('../SocialLogin');

describe('Social Login Class', () => {
  it('should expose default options', () => {
    expect(SocialLogin.defaultOptions).toMatchInlineSnapshot(`
Object {
  "ProfileModelConfig": Object {
    "name": "Profile",
    "options": Object {
      "acls": Array [
        Object {
          "permission": "DENY",
          "principalId": "$everyone",
          "principalType": "ROLE",
          "property": "*",
        },
        Object {
          "permission": "ALLOW",
          "principalId": "$owner",
          "principalType": "ROLE",
          "property": "*",
        },
      ],
      "base": "PersistedModel",
      "dataSource": null,
    },
    "properties": Object {
      "credentials": Object {
        "type": "object",
      },
      "externalId": Object {
        "required": true,
        "type": "string",
      },
      "profileData": Object {
        "type": "object",
      },
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

  describe('Scheme guessing', () => {
    it('should be a function', () => {
      expect(typeof SocialLogin.guessScheme).toBe('function');
    });

    it('should suggest Local if no options were passed', () => {
      expect(SocialLogin.guessScheme()).toBe('Local');
    });

    it('should suggest OAuth2.0 if options have clientID', () => {
      expect(SocialLogin.guessScheme({clientID: 'test'})).toBe('OAuth2.0');
    });

    it('should suggest OAuth1 if there is consumerKey', () => {
      expect(SocialLogin.guessScheme({consumerKey: 'test'})).toBe('OAuth1');
    });

    it('should suggest Local if there is usernameField key', () => {
      expect(SocialLogin.guessScheme({usernameField: 'test'})).toBe('Local');
    });

    it('should throw an error if could not guess the scheme', () => {
      expect(() =>
        SocialLogin.guessScheme({})
      ).toThrowErrorMatchingInlineSnapshot(
        `"Can not infer scheme by options. Provide custom scheme name or implementation via config.scheme."`
      );
    });
  });

  describe('Mode guessing', () => {
    it('should suggest authenticate if name contains "login"', () => {
      expect(SocialLogin.guessMode('loginWithFacebook')).toBe('authenticate');
    });

    it('should suggest authenticate if name contains "signup"', () => {
      expect(SocialLogin.guessMode('SignUPViaTwitter')).toBe('authenticate');
    });

    it('should suggest authorize if name contains "link"', () => {
      expect(SocialLogin.guessMode('linkGoogleAccount')).toBe('authorize');
    });

    it('should suggest authorize if name contains "connect"', () => {
      expect(SocialLogin.guessMode('ConnectGithub')).toBe('authorize');
    });

    it('should throw an error if could not guess the mode', () => {
      expect(() =>
        SocialLogin.guessMode('test')
      ).toThrowErrorMatchingInlineSnapshot(
        `"Can not infer mode (authenticate or authorize) for \\"test\\". Provide mode name via config.mode."`
      );
    });
  });
});
