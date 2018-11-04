# loopback-social-login-component

Loopback component implementing social login for loopback API server

## Motivation

I want it to be a simple drop-in component that

- Allows to extend `Users` collection with custom login/connect methods (for example `Users.loginWithFacebook` or `Users.connectTwitterAccount`) via boot scripts.

- Is highly reusable and extendable.

- Is API centric. No sessions by default.

- Does not require me to manually define additional models, setup relations, write custom config files, add middlewares and such.

- Has minimal API that assumes user if familiar with `passportjs` and knows how to setup passport js strategies.

- Prefers code over configs.

- Could be easily switched off via `component-config.json`.

- Targets modern node versions >= 8.

- Has clear concise implementation.
