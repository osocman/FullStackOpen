const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Blog = require('../models/blog');
const logger = require('./logger');

// eslint-disable-next-line no-unused-vars
const requestLogger = (req, res, next) => {
  logger.info('Method: ', req.method);
  logger.info('Path: ', req.path);
  logger.info('Body: ', req.body);
  logger.info('-----');
  next();
};

const authenticateToken = async (req, res, next) => {
  try {
    const tokenHeader = req.headers.authorization;

    // verify there is an authorization header in the request
    if (!(tokenHeader && tokenHeader.toLowerCase().startsWith('bearer'))) {
      res.status(401).json({ error: 'authentication failed: invalid or missing authorization header' });
      return;
    }

    const token = tokenHeader.substring(7);

    // verify validity of token
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userId = decodedToken.id;
    if (!userId) {
      res.status(401).json({ error: 'authentication failed: invalid or missing token' });
      return;
    }

    const user = await User.findById(userId);
    req.user = user; // add a user property to request

    next();
  } catch (error) {
    next(error);
  }
};

const unknowEndpoint = (req, res) => {
  res.status(404).json({ error: 'unknown endpoint' });
};

const errorHandler = (error, req, res, next) => {
  logger.error('AN ERROR OCCURED:');
  logger.error(error.message);

  if (error.name === 'CastError') {
    res.status(400).json({ error: 'malformatted id' });
    return;
  } if (error.name === 'ValidationError') {
    res.status(400).json({ error: error.message });
    return;
  } if (error.name === 'JsonWebTokenError') {
    res.status(401).json({ error: 'invalid token' });
  }

  next(error);
};

module.exports = {
  requestLogger,
  authenticateToken,
  unknowEndpoint,
  errorHandler,
};
