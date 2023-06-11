const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/secrets');
module.exports = (req, res, next) => {
  const token = req.headers.authorization;
  console.log(token);

  if (!token) {
    res.status(401).json({ message: 'token required' });
    return;
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(401).json({ message: 'token invalid', err });
      return;
    } else {
      req.decodedJwt = decoded;
      next();
    }
  });
};