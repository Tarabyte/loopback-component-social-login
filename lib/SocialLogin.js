const SG = require('strong-globalize');
const g = SG();
const loopback = require('loopback');
const passport = require('passport');

const invariant = require('invariant');
const debug = require('debug')('loopback:component:social-login');

const ProfileModelConfig = require('./ProfileModelConfig');
const asyncHandler = require('./utils/asyncHandler');

class SocialLogin {
  static get defaultOptions() {
    return {
      socialLoginProp: 'socialLogin',
      tokenMiddlewareOptions: {},
      UserModelName: 'User',
      ProfileModelConfig,
      session: false
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

    this.attachModels();
    this.installMiddlewares();

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
      options: {tokenMiddlewareOptions, session}
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

    if (session) {
      debug('Enabling session support because session flag is on.');

      app.middleware('session:after', passport.session());

      passport.serializeUser(user => user.id);
      passport.deserializeUser(
        asyncHandler(
          async id =>
            await this.UserModel.findById(id, {
              include: {
                relation: 'profiles',
                scope: {
                  fields: ['provider']
                }
              }
            })
        )
      );
    }
  }

  attachModels() {
    const {
      app,
      options: {UserModelName, ProfileModelConfig}
    } = this;

    const User = app.registry.findModel(UserModelName);

    invariant(
      typeof User === 'function',
      `Application should have User Model named ${UserModelName}`
    );

    this.UserModel = User;

    if (!ProfileModelConfig) {
      debug(
        'Skipping Profile Model creation since ProfileModelConfig was not specified. Assuming User already has profiles relation.'
      );

      this.ProfileModel = User.relations.profiles.modelTo;
      return;
    }

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
