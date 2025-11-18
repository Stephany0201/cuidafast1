const handler = require('../back-end/api/routes/authRoutes');

module.exports = async (req, res) => {
  return handler(req, res);
};
