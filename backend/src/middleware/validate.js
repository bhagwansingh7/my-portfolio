const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = {};
  result.array({ onlyFirstError: true }).forEach((e) => {
    if (!errors[e.path]) errors[e.path] = e.msg;
  });
  return res.status(422).json({ message: 'Please correct the highlighted fields.', errors });
};
