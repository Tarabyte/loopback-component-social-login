const debug = require('debug')('loopback:component:social-login:authorize');
const g = require('strong-globalize')();

module.exports = (Model, options = {}) => {
  const {userRelation = 'user', as = 'authorize'} = options;

  Model[as] = async function(
    userId,
    provider,
    externalId,
    profileData,
    credentials
  ) {
    debug(`Authorizing profile via ${provider} with id ${externalId}`);

    const {modelTo: UserModel} = this.relations[userRelation];

    const user = await UserModel.findById(userId);

    if (!user) {
      throw new Error(g.f('User with the id %s does not exist.', userId));
    }

    const id = {provider, externalId};

    let profile = await this.findOne({
      where: id,
      include: userRelation
    });

    if (profile) {
      debug('Updating existing profile.');

      if (profile.user().id !== userId) {
        throw new Error(g.f('This profile belongs to a different user.'));
      }

      await profile.updateAttributes({profileData, credentials});
    } else {
      debug('Creating a new profile.');

      profile = new this({
        ...id,
        profileData,
        credentials
      });

      profile[userRelation](user);

      await profile.save();
    }

    return {
      user,
      profile
    };
  };
};
