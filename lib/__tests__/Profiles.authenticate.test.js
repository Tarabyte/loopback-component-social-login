const socialLogin = require('../');
const makeLoopbackApp = require('loopback-app');

describe('Profiles Authenticate', () => {
  let app = null;
  let Profiles = null;
  let Users = null;

  beforeAll(() => {
    app = makeLoopbackApp();
    socialLogin(app);

    ({Profile: Profiles, User: Users} = app.models);
  });

  it('should be ok', () => {
    expect(Profiles).toBeTruthy();
  });

  it('should be a function', () => {
    expect(typeof Profiles.authenticate).toBe('function');
  });

  describe('Create a new user', () => {
    beforeEach(async () => {
      await Users.deleteAll();
      await Profiles.deleteAll();
    });

    it('should create new profile and user', async () => {
      const provider = 'test-provider';
      const externalId = 'test-id';
      const profileData = {
        emails: [{value: 'test@test.com'}],
        id: externalId
      };

      const credentials = {
        test: 1
      };

      await Profiles.authenticate(
        provider,
        externalId,
        profileData,
        credentials
      );

      const profile = await Profiles.findOne({
        provider,
        externalId
      });

      expect(profile).toMatchInlineSnapshot(`
Object {
  "credentials": Object {
    "test": 1,
  },
  "externalId": "test-id",
  "id": 1,
  "profileData": Object {
    "emails": Array [
      Object {
        "value": "test@test.com",
      },
    ],
    "id": "test-id",
  },
  "provider": "test-provider",
  "userId": 1,
}
`);
      const user = await profile.user.get();

      expect(user).toMatchInlineSnapshot(`
Object {
  "email": "test@test.com",
  "emailVerified": undefined,
  "id": 1,
  "realm": undefined,
  "username": "test-provider.test-id",
}
`);
    });

    it('should update existing profile', async () => {
      const provider = 'test-provider';
      const externalId = 'test-id';
      const profileData = {
        emails: [{value: 'test@test.com'}],
        id: externalId
      };

      const credentials = {
        test: 1
      };

      await Profiles.authenticate(
        provider,
        externalId,
        profileData,
        credentials
      );

      const newCredentials = {
        newCredentials: 1
      };

      await Profiles.authenticate(
        provider,
        externalId,
        profileData,
        newCredentials
      );

      const profiles = await Profiles.find({
        where: {
          provider,
          externalId
        }
      });

      expect(profiles.length).toBe(1);

      expect(profiles[0].credentials).toEqual(newCredentials);

      const users = await Users.find();

      expect(users.length).toBe(1);
    });
  });
});
