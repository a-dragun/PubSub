function cacheControl(req, res, next) {
    res.setHeader('Cache-Control', 'no-store');
    next();
  }
  
  module.exports = cacheControl;
  