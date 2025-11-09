// src/shared/error.js
export class HttpError extends Error {
  constructor(status = 500, message = 'Internal Server Error', code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const body = {
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code,
    },
  };
  if (process.env.NODE_ENV === 'development' && err.stack) {
    body.error.stack = err.stack;
  }
  res.status(status).json(body);
}
