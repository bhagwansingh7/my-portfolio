const rateLimit = require('express-rate-limit');

const make = (windowMs, limit, message, extra = {}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message },
    ...extra,
  });

module.exports = {
  loginLimiter: make(15 * 60 * 1000, 10, 'Too many sign-in attempts. Try again in 15 minutes.', {
    skipSuccessfulRequests: true,
  }),
  contactLimiter: make(60 * 60 * 1000, 5, 'You have sent several messages recently. Please try again later.'),
  apiLimiter: make(60 * 1000, 300, 'Too many requests. Slow down and try again shortly.'),
};
