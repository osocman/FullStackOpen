const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./utils/config');
const logger = require('./utils/logger');
const loginRouter = require('./controllers/loginRouter');
const blogsRouter = require('./controllers/blogsRouter');
const usersRouter = require('./controllers/usersRouter');
const middleware = require('./utils/middleware');

const app = express();

//* CONNECTING
logger.info(`Connecting to ${config.MONGODB_URI}`);
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB', error.message);
  });

//* MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

//* CONTROLLERS
app.use('/api/login', loginRouter);
app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);

//* MIDDLEWARE
app.use(middleware.unknowEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
