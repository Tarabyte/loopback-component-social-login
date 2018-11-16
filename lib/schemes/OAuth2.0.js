/* eslint-disable no-console */
const g = require('strong-globalize')();
const passport = require('passport');
const debug = require('debug')('loopback:component:social-login:oauth2.0');
const getUrl = require('./utils/getUrl');
const allowEveryone = require('./utils/allowEveryone');
const asyncHandler = require('../utils/asyncHandler');

const makeHandler = (ProfileModel, mode) => {
  let handler = null;

  if (mode === 'authenticate') {
    handler = async (_, accessToken, refreshToken, profileData) => {
      const {user, token} = await ProfileModel.authenticate(
        profileData.provider,
        profileData.id,
        profileData,
        {
          accessToken,
          refreshToken
        }
      );

      return [user, {token}];
    };
  }

  if (mode === 'authorize') {
    handler = async (req, accessToken, refreshToken, profileData) => {
      const userId = req.accessToken && req.accessToken.userId;

      if (!userId) {
        throw new Error(g.f('No user is logged in.'));
      }

      const {user, profile} = await ProfileModel.authorize(
        userId,
        profileData.provider,
        profileData.id,
        profileData,
        {
          accessToken,
          refreshToken
        }
      );

      return [user, {profile}];
    };
  }

  if (!handler) {
    throw new Error(g.f('Unknown mode %s', mode));
  }

  return asyncHandler(handler, 4, {spread: true});
};

module.exports = ({
  name,
  Strategy,
  options,
  UserModel,
  ProfileModel,
  app,
  mode,
  session,
  authOptions
}) => {
  debug(`Installing OAuth2.0 strategy "${name}".`);

  const methodName = name;
  const callbackMethodName = `${methodName}Callback`;

  const callbackURL = getUrl(app, UserModel, methodName, 'callback');
  const formatURL = (successRedirect, failureRedirect) => {
    const params = [];
    if (successRedirect) {
      params.push(`successRedirect=${encodeURIComponent(successRedirect)}`);
    }

    if (failureRedirect) {
      params.push(`failureRedirect=${encodeURIComponent(failureRedirect)}`);
    }

    return params.length ? `${callbackURL}?${params.join('&')}` : callbackURL;
  };

  if (options.callbackURL) {
    console.warn(
      g.f(
        'Do not provide callbackURL. Provided url "%s" will be replaced with "%s".',
        options.callbackURL,
        callbackURL
      )
    );
  }

  const strategyOptions = {
    ...options,
    passReqToCallback: true,
    callbackURL
  };

  debug('Final strategy options are: ', strategyOptions);

  const strategy = new Strategy(
    strategyOptions,
    makeHandler(ProfileModel, mode)
  );

  passport.use(name, strategy);

  debug(`Defining static ${UserModel.modelName}.${methodName} method.`);

  UserModel[methodName] = function(req, res, options, next) {
    const {successRedirect, failureRedirect, ...moreOptions} = options
      ? JSON.parse(options)
      : {};

    const callbackURL = formatURL(successRedirect, failureRedirect);

    debug(
      `Using ${name} strategy to ${mode} with "${callbackURL}" callbackURL`
    );

    passport[mode](name, {
      ...moreOptions,
      session,
      callbackURL
    })(req, res, next);
  };

  allowEveryone(UserModel, methodName);

  UserModel.remoteMethod(methodName, {
    http: {
      verb: 'get',
      status: 307
    },
    accepts: [
      {
        arg: 'req',
        type: 'object',
        http: {
          source: 'req'
        }
      },
      {
        arg: 'res',
        type: 'object',
        http: {
          source: 'res'
        }
      },
      {
        arg: 'options',
        type: 'string',
        http: {
          source: 'query'
        }
      }
    ]
  });

  debug(`Defining static ${UserModel.modelName}.${callbackMethodName} method.`);

  UserModel[callbackMethodName] = function(
    req,
    res,
    successRedirect,
    failureRedirect,
    next
  ) {
    passport[mode](
      name,
      {session, callbackURL: formatURL(successRedirect, failureRedirect)},
      (err, user, info) => {
        if (err) {
          debug(`${name} ${mode} failed.`, err, info);
          return next(err);
        }
        if (user) {
          const url = successRedirect || authOptions.successRedirect;

          debug(`${name} ${mode} success. Redirecting to ${url}`);
          res.redirect(url);
        } else {
          const url = failureRedirect || authOptions.failureRedirect;

          debug(`${name} ${mode} failure. Redirecting to ${url}`);
          res.redirect(url);
        }
      }
    )(req, res, next);
  };

  allowEveryone(UserModel, callbackMethodName);

  UserModel.remoteMethod(callbackMethodName, {
    http: {
      verb: 'get',
      path: `/${methodName}/callback`
    },
    accepts: [
      {
        arg: 'req',
        type: 'object',
        http: {
          source: 'req'
        }
      },
      {
        arg: 'res',
        type: 'object',
        http: {
          source: 'res'
        }
      },
      {
        arg: 'successRedirect',
        type: 'string',
        http: {
          source: 'query'
        }
      },
      {
        arg: 'failureRedirect',
        type: 'string',
        http: {
          source: 'query'
        }
      }
    ]
  });

  return () => {
    // remove strategy from passport storage
    passport.unuse(name);

    // disable remoting
    UserModel.disableRemoteMethodByName(methodName);
    UserModel.disableRemoteMethodByName(callbackMethodName);
  };
};
