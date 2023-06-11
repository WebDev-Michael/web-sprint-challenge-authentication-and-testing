const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { validatePayload, validateUsername } = require('./auth-middleware');
const { JWT_SECRET } = require('../../config/secrets');
const Users = require('./auth-model');
const jwt = require('jsonwebtoken');

router.post('/register', validatePayload, validateUsername, (req, res) => {
  const user = req.body;
  const hash = bcrypt.hashSync(user.password, 7);
  user.password = hash;
  Users.insert(user)
    .then(() => {
      Users.getByUsername(user.username).then((returnedUser) => {
        res.status(200).json(returnedUser);
      });
    })
    .catch((err) => {
      res.status(404).json({
        message: 'username taken',
      });
    });
});

router.post('/login', validatePayload, (req, res) => {
  const { username, password } = req.body;
  Users.getByUsername(username).then((user) => {
    if (!user || !bcrypt.compareSync(password, user.password)) {
      res.status(401).json({
        message: 'Invalid credentials',
      });
      return;
    }
    const token = generateToken(user);
    req.session.user = user;
    req.headers.authorization = token;
    res.status(200).json({ message: `welcome, ${user.username}`, token });
  });
});

const generateToken = (user) => {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: '1d',
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

module.exports = router;
