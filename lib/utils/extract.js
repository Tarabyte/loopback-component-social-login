// eslint-disable-next-line eqeqeq
const goDeeper = (target, prop) => (target != null ? target[prop] : target);

module.exports = (obj, path, defaults) => {
  const value = path.split('.').reduce(goDeeper, obj);

  return value != null // eslint-disable-line eqeqeq
    ? value
    : typeof defaults === 'function'
      ? defaults(obj, path)
      : defaults;
};
