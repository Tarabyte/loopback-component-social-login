const SG = require('strong-globalize');
const g = SG();
const loopback = require('loopback');
const passport = require('passport');

const invariant = require('invariant');
const debug = require('debug')('loopback:component:social-login');

const ProfileModelConfig = require('./ProfileModelConfig');
const authenticate = require('./mixins/authenticate');
const authorize = require('./mixins/authorize');
const asyncHandler = require('./utils/asyncHandler');

const SCHEMES = require('./schemes');

const AUTHENTICATE = 'authenticate';
const AUTHORIZE = 'authorize';

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

  static guessScheme(options) {
    debug('Guessing scheme by options.');

    if (typeof options === 'undefined') {
      debug('Since options are undefined usin Local scheme.');
      return 'Local';
    }

    if (options.consumerKey) {
      debug('Since options have "consumerKey" field using OAuth1 scheme.');
      return 'OAuth1';
    }

    if (options.clientID) {
      debug('Since options have "clientID" field using OAuth2.0 scheme.');
      return 'OAuth2.0';
    }

    if (options.usernameField) {
      debug('Since options have "usernameField" field using Local scheme.');
      return 'Local';
    }

    invariant(
      false,
      g.f(
        'Can not infer scheme by options. Provide custom scheme name or implementation via config.scheme.'
      )
    );
  }

  static guessMode(name) {
    name = name.toLowerCase();

    const included = item => name.includes(item);

    const authenticate = ['login', 'signup', 'authenticate'].find(included);

    if (authenticate) {
      debug(
        `Since ${name} includes "${authenticate}" using authenticate mode.`
      );
      return AUTHENTICATE;
    }

    const authorize = ['link', 'connect', 'authorize'].find(included);

    if (authorize) {
      debug(`Since ${name} includes "${authorize}" using authorize mode.`);
      return AUTHORIZE;
    }

    invariant(
      false,
      g.f(
        'Can not infer mode (authenticate or authorize) for "%s". Provide mode name via config.mode.',
        name
      )
    );
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

    this.schemes = new Map();

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
      debug(
        'Warning! You need to manually add session parsing middleware to enable session.' +
          'This component only configures passport.session().'
      );

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

    const createProfileModel = Boolean(ProfileModelConfig);

    if (createProfileModel) {
      const db = User.getDataSource();

      invariant(
        db,
        `User Model named ${UserModelName} should be attached to a datasource.`
      );

      debug('Creating Profile Model using config: ', ProfileModelConfig);
      const Profile = (this.ProfileModel = app.registry.createModel(
        ProfileModelConfig
      ));

      debug(`Attaching Profile Model to datasource ${db.name}.`);
      app.model(Profile, {public: false, dataSource: db.name});

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

      // add authenticate method
      authenticate(Profile);

      // add authorize method
      authorize(Profile);
    } else {
      debug(
        'Skipping Profile Model creation since ProfileModelConfig was not specified. Assuming User already has profiles relation.'
      );

      // extract Profile Model from User --(has many)--> Profiles relation
      this.ProfileModel = User.relations.profiles.modelTo;
    }
  }

  authenticate(name, config) {
    return this.install(
      name,
      Object.assign({}, config, {
        mode: AUTHENTICATE
      })
    );
  }

  authorize(name, config) {
    return this.install(
      name,
      Object.assign({}, config, {
        mode: AUTHORIZE
      })
    );
  }

  /**
   * Install a strategy name.
   */
  install(name, config) {
    invariant(
      name && typeof name === 'string',
      `Expectng name to be non-empty string. Got "${name}" instead.`
    );

    const {
      Strategy,
      options,
      scheme: schemeName = SocialLogin.guessScheme(options),
      mode = SocialLogin.guessMode(name),
      authOptions
    } = config;

    debug(
      `Implementing social login ${name} with scheme "${
        typeof schemeName === 'function' ? 'custom' : schemeName
      }"`
    );

    const scheme =
      typeof schemeName === 'function' ? schemeName : SCHEMES[schemeName];

    invariant(
      typeof scheme === 'function',
      `Expecting scheme to be a function. Got ${typeof scheme} instead.`
    );

    const {
      UserModel,
      ProfileModel,
      app,
      options: {session}
    } = this;

    const cleanUp = scheme({
      name,
      Strategy,
      options,
      UserModel,
      ProfileModel,
      app,
      session,
      mode,
      authOptions
    });

    invariant(
      typeof cleanUp === 'function',
      `Custom scheme should return uninstall callback. Got "${typeof cleanUp}" instead.`
    );

    this.schemes.set(name, cleanUp);

    return this;
  }

  /**
   * Unuse strategy by name.
   */
  uninstall(name) {
    debug(`Uninstalling scheme ${name}.`);
    const {schemes} = this;

    invariant(
      schemes.has(name),
      `Unable to uninstall scheme ${name}. It either has never been installed or has been already uninstalled before.`
    );

    const cleanUp = schemes.get(name);

    cleanUp();

    schemes.delete(name);
  }
}

module.exports = SocialLogin;
