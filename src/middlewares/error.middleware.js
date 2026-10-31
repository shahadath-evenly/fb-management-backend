import { env } from '../config/env.js';

export function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (env.nodeEnv !== 'production') {
    console.error(err);
  }

  const body = {
    success: false,
    message,
  };

  if (err.errors) {
    body.errors = err.errors;
  }

  if (env.nodeEnv !== 'production') {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
