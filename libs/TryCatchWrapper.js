module.exports = function (func) {
  return function (...args) {
    try {
      return func.apply(null, args);
    } catch (err) {
      throw err;
    }
  };
};
