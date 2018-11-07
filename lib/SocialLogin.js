const SG = require('strong-globalize');
const g = SG();
const loopback = require('loopback');
const passport = require('passport');

const invariant = require('invariant');
const debug = require('debug')('loopback:component:social-login');

const ProfileModelConfig = require('./ProfileModelConfig');

class SocialLogin {
  static get defaultOptions() {
    return {
      socialLoginProp: 'socialLogin',
      tokenMiddlewareOptions: {},
      UserModelName: 'User',
      ProfileModelConfig
    };
  }

  constructor(app, options = {}) {
    this.app = app;
    this.options = Object.assign({}, SocialLogin.defaultOptions, options);

    this.init();
  }

  init() {
    debug('Initializing Social Login Component');
    const {
      app,
      options: {socialLoginProp}
    } = this;

    this.installMiddlewares();
    this.attachModels();

    invariant(
      !(socialLoginProp in app),
      g.f('Application instance already has something called "%s".', [
        socialLoginProp
      ])
    );

    app[socialLoginProp] = this;
  }

  installMiddlewares() {
    const {
      app,
      options: {tokenMiddlewareOptions}
    } = this;

    debug(
      `Installing loopback#token middleware to run on auth phase with options ${JSON.stringify(
        tokenMiddlewareOptions
      )}`
    );
    app.middleware('auth', loopback.token(tokenMiddlewareOptions));

    debug(
      'Installing passport.initialize() middleware to run on session:after phase.'
    );
    app.middleware('session:after', passport.initialize());
  }

  attachModels() {
    const {
      app,
      options: {UserModelName, ProfileModelConfig}
    } = this;

    if (!ProfileModelConfig) {
      debug(
        'Skipping Profile Model creation since ProfileModelConfig was not specified'
      );
      return;
    }

    const User = app.registry.findModel(UserModelName);

    invariant(
      typeof User === 'function',
      `Application should have User Model named ${UserModelName}`
    );

    const db = User.getDataSource();

    invariant(
      db,
      `User Model named ${UserModelName} should be attached to a datasource.`
    );

    debug('Creating Profile Model using config: ', ProfileModelConfig);
    const Profile = app.registry.createModel(ProfileModelConfig);

    debug(`Attaching Profile Model to datasource ${db.name}.`);
    app.model(Profile);
    Profile.attachTo(db);

    debug('Defining User <--> Profile relations.');
    invariant(
      !Profile.relations.user,
      'Profile Model already has a relation named "user".'
    );
    Profile.belongsTo(User, {as: 'user'});

    invariant(
      !User.relations.profiles,
      'User Model already has a relation named "profiles".'
    );
    User.hasMany(Profile, {as: 'profiles'});

    this.UserModel = User;
    this.ProfileModel = Profile;
  }
}

module.exports = SocialLogin;
