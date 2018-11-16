const socialLogin = require('../');
const makeLoopbackApp = require('loopback-app');

describe('Profiles Authorize', () => {
  let app = null;
  let Profiles = null;
  let Users = null;

  beforeAll(() => {
    app = makeLoopbackApp();
    socialLogin(app);

    ({Profile: Profiles, User: Users} = app.models);
  });

  beforeEach(async () => {
    await Users.deleteAll();
    await Profiles.deleteAll();
  });

  it('should be a function', () => {
    expect(typeof Profiles.authorize).toBe('function');
  });

  it('should create a new Profile', async () => {
    const user = await Users.create({email: 'test@test.com', password: 'test'});

    const profileData = {
      id: 'test-profile-id',
      someData: {test: 1},
      emails: [{value: 'test@test.com'}]
    };

    const credentials = {
      test: 1
    };

    const {user: userResult, profile} = await Profiles.authorize(
      user.id,
      'test-provider',
      profileData.id,
      profileData,
      credentials
    );

    expect(profile).toMatchInlineSnapshot(`
Object {
  "credentials": Object {
    "test": 1,
  },
  "externalId": "test-profile-id",
  "id": 1,
  "profileData": Object {
    "emails": Array [
      Object {
        "value": "test@test.com",
      },
    ],
    "id": "test-profile-id",
    "someData": Object {
      "test": 1,
    },
  },
  "provider": "test-provider",
  "userId": 1,
}
`);

    expect(userResult).toMatchObject(user.toJSON());
  });

  it('should update profile if existed', async () => {
    const user = await Users.create({email: 'test@test.com', password: 'test'});

    const profileData = {
      id: 'test-profile-id',
      someData: {test: 1},
      emails: [{value: 'test@test.com'}]
    };

    const credentials = {
      test: 1
    };

    const profile = new Profiles({
      provider: 'test-provider',
      externalId: profileData.id,
      profileData,
      credentials
    });

    profile.user(user);

    await profile.save();

    const newProfileData = {
      id: 'test-profile-id',
      someData: {test: 2},
      emails: [{value: 'test@test.com'}]
    };

    const newCredentials = {test: 2};

    const {profile: linkedProfile, user: linkedUser} = await Profiles.authorize(
      user.id,
      'test-provider',
      newProfileData.id,
      newProfileData,
      newCredentials
    );

    expect(linkedProfile).toMatchInlineSnapshot(`
Object {
  "credentials": Object {
    "test": 2,
  },
  "externalId": "test-profile-id",
  "id": 2,
  "profileData": Object {
    "emails": Array [
      Object {
        "value": "test@test.com",
      },
    ],
    "id": "test-profile-id",
    "someData": Object {
      "test": 2,
    },
  },
  "provider": "test-provider",
  "user": Object {
    "email": "test@test.com",
    "emailVerified": undefined,
    "id": 2,
    "realm": undefined,
    "username": undefined,
  },
  "userId": 2,
}
`);
    expect(linkedUser.id).toBe(user.id);
  });

  it('should throw if no user exists', async () => {
    expect.assertions(1);

    await expect(
      Profiles.authorize(
        'non-existent-id',
        'test-provider',
        'test-external-id',
        {},
        {}
      )
    ).rejects.toMatchInlineSnapshot(
      `[Error: User with the id non-existent-id does not exist.]`
    );
  });

  it('should throw if profile belongs to a different user', async () => {
    const user = await Users.create({email: 'test@test.com', password: 'test'});
    const profile = await Profiles.create({
      provider: 'test-provider',
      externalId: 'test-external-id',
      profileData: {},
      credentials: {},
      userId: user.id
    });

    const anotherUser = await Users.create({
      email: 'test2@test.com',
      password: 'test'
    });

    expect.assertions(1);

    await expect(
      Profiles.authorize(
        anotherUser.id,
        profile.provider,
        profile.externalId,
        {},
        {}
      )
    ).rejects.toMatchInlineSnapshot(
      `[Error: This profile belongs to a different user.]`
    );
  });
});
