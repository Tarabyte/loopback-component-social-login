const debug = require('debug')('loopback:component:social-login:authenticate');
const extractUserFromProfile = require('../utils/extractUserFromProfile');

module.exports = (Model, options = {}) => {
  const {userRelation = 'user', as = 'authenticate'} = options;

  Model[as] = async function(
    provider,
    externalId,
    profileData,
    credentials,
    runtimeOptions = {}
  ) {
    debug(`Authenticating profile via ${provider} with id ${externalId}`);
    const {mapProfileToUser = extractUserFromProfile} = runtimeOptions;

    // compound identifier
    const id = {
      provider,
      externalId
    };

    let profile = await this.findOne({
      where: id,
      include: userRelation
    });

    let user = null;

    if (profile) {
      debug('Updating existing profile with new data.');
      await profile.updateAttributes({profileData, credentials});

      // the user is loaded via include filter
      user = profile[userRelation]();
    } else {
      debug('Creating a new user for profile.');
      const {modelTo: UserModel} = this.relations[userRelation];

      user = await UserModel.create(
        mapProfileToUser(profileData, provider, credentials)
      );

      profile = new this({
        ...id,
        profileData,
        credentials
      });

      profile[userRelation](user);

      await profile.save();
    }

    debug('Creating new access token for user.');
    const token = await user.createAccessToken();

    return {
      user,
      token
    };
  };
};
