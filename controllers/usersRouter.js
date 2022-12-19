const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const usersRouter = express.Router();

usersRouter.get('/', async (req, res, next) => {
  try {
    const users = await User.find({}).populate('blogs', {
      url: 1,
      title: 1,
      author: 1,
    });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  const user = req.body;
  const updatedUser = await User.findByIdAndUpdate(id, user);
  res.status(200).json(updatedUser);
});

usersRouter.post('/', async (req, res, next) => {
  try {
    const { username, password, name } = req.body;

    const errors = [];

    const usernameInDb = await User.find({ username });
    if (usernameInDb[0]) {
      errors.push('username is already taken');
    }
    const passwordValid = password && password.length > 5;
    if (!passwordValid) {
      errors.push('password must be longer than 5 characters');
    }

    if (!errors[0]) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const user = new User({ username, passwordHash, name });

      const savedUser = await user.save();
      res.status(201).json(savedUser);
    } else {
      res.status(400).json({ error: errors });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
