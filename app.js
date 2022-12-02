console.log('running App');

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./utils/config');
const logger = require('./utils/logger');
const blogsRouter = require('./controllers/blogsRouter');
const middleware = require('./utils/middleware');

const app = express();

// CONNECTING
logger.info(`Connecting to ${config.MONGODB_URI}`);
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB', error.message);
  });

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

// CONTROLLERS
app.use('/api/blogs', blogsRouter);

module.exports = app;
