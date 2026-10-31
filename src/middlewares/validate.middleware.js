import { ApiError } from '../utils/ApiError.js';

const VALIDATABLE_KEYS = ['body', 'params', 'query'];

export function validate(schemas) {
  return async function (req, res, next) {
    try {
      for (const key of VALIDATABLE_KEYS) {
        if (schemas[key]) {
          req[key] = await schemas[key].validate(req[key], {
            abortEarly: false,
            stripUnknown: true,
          });
        }
      }
      next();
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = err.inner.length
          ? err.inner.map((innerErr) => ({ path: innerErr.path, message: innerErr.message }))
          : [{ path: err.path, message: err.message }];
        next(new ApiError(400, 'Validation failed', errors));
      } else {
        next(err);
      }
    }
  };
}
