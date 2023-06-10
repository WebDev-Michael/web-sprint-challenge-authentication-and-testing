const router = require('express').Router();
const Auth = require('./auth-model')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'shh'


router.post('/register', async (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).json({message: "username and password required"})
  } else {
  let {username, password} = req.body;
  username = username.replace(/[^a-zA-Z0-9]/g, '').trim();
  if (!username || typeof username != 'string' || username.trim() == '') {
        res.status(400).json({message: "username and password required"})
        return 
  } 
   if (typeof password != 'string' || password.trim() == '' || password == null) {
    res.status(400).json({message: "username and password required"})
    return 
}

try{
  const [user] = await Auth.findBy({'username': username})
  if (user) {
    res.status(401).json({message: "username taken"})
    return
  } 
}catch (err){
  next(err)
}

  const hash = bcrypt.hashSync(password, 8);

    Auth.add({username, password: hash})
    .then(resp => {
      res.status(201).json(resp)
      return
    }).catch(err => {
      next(err)
    })}
  });

  

router.post('/login', async (req, res, next) => {
  
   const {username, password} = req.body
 
  
   if (typeof username != 'string' || username.trim() == '') {
    res.status(400).json({message: "username and password required"})
    return }  
    if (typeof password != 'string' || password.trim() == '') {
      res.status(400).json({message: "username and password required"})
      return }  
    

  try{
    const [user] = await Auth.findBy({username: req.body.username})
    if (user==null) {
      next({status: 401, message: "invalid credentials"})
    } else {
      req.user = user
    if (bcrypt.compareSync(req.body.password, req.user.password)) {
      const token = buildToken(req.user)
      res.status(200).json({message: `welcome, ${req.user.username}`, token})
    } else {
      next({status:401, message: 'invalid credentials'})
    }
    
      }
    }catch (err){
      next(err)
    }


  function buildToken(user) {
    const payload = {
      subject: user.user_id, 
      role_name: user.role_name, 
      username: user.username
    }
    const options = {
      expiresIn: '1d', 
    }
    return jwt.sign(payload, JWT_SECRET, options)
  }
});

module.exports = router;