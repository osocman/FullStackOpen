const logger = require('./logger');

// eslint-disable-next-line no-unused-vars
const requestLogger = (req, res, next) => {
  logger.info('Method: ', req.method);
  logger.info('Path: ', req.path);
  logger.info('Body: ', req.body);
  logger.info('-----');
  next();
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
  }

  next(error);
};

module.exports = { requestLogger, unknowEndpoint, errorHandler };
