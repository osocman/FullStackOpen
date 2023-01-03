const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const loginRouter = express.Router();

loginRouter.post('/', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    const passwordCorrect = user === null
      ? false
      : await bcrypt.compare(password, user.passwordHash);

    if (user && passwordCorrect) {
      const userPayload = { username: user.username, id: user.id };

      const token = jwt.sign(userPayload, process.env.SECRET);

      res
        .status(200)
        .send({ token, username: user.username, name: user.name });
    } else {
      res.status(401).send({ error: 'invalid username or password' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = loginRouter;
