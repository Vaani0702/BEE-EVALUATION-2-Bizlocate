// Express 4 does not catch errors thrown inside async functions by itself.
// This small wrapper runs our async controller and, if anything fails,
// passes the error to next() so our error-handling middleware replies.
// (It saves us from writing try/catch in every single controller.)
module.exports = function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
