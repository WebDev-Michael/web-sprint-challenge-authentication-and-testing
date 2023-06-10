const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'shh'

module.exports = (req, res, next) => {
  const token = req.headers.authorization
  if(!token) {
    return res.status(401).json({message: "token required"})
  }
  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
    if(err) {
      return next({status: 401, message: "Token invalid"})
    }else {
      req.decodedToken = decodedToken;
      next()
    }

  })
  };
