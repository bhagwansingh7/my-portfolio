const { body } = require('express-validator');
const { stripHtml } = require('../utils/sanitize');

const MSG_URL = 'Enter a full URL starting with http:// or https://';

/** Required plain-text field. */
const reqText = (field, label, max, min = 1) => {
  let chain = body(field)
    .isString().withMessage(`${label} is required.`).bail()
    .customSanitizer(stripHtml)
    .notEmpty().withMessage(`${label} is required.`).bail();
  if (min > 1) chain = chain.isLength({ min }).withMessage(`${label} must be at least ${min} characters.`);
  return chain.isLength({ max }).withMessage(`${label} must be ${max} characters or fewer.`);
};

/** Optional plain-text field (empty string allowed). */
const optText = (field, label, max) =>
  body(field).optional({ values: 'falsy' })
    .isString().withMessage(`${label} must be text.`).bail()
    .customSanitizer(stripHtml)
    .isLength({ max }).withMessage(`${label} must be ${max} characters or fewer.`);

/** Not required, but if present it must not be empty (for partial updates). */
const presentText = (field, label, max) =>
  body(field).optional()
    .isString().withMessage(`${label} must be text.`).bail()
    .customSanitizer(stripHtml)
    .notEmpty().withMessage(`${label} is required.`).bail()
    .isLength({ max }).withMessage(`${label} must be ${max} characters or fewer.`);

const optUrl = (field, label) =>
  body(field).optional({ values: 'falsy' })
    .isString().bail()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true, max_allowed_length: 500 })
    .withMessage(`${label}: ${MSG_URL}`);

// Uploaded assets are stored as "/uploads/<file>" (or an absolute http(s) URL).
const optAsset = (field, label) =>
  body(field).optional({ values: 'falsy' })
    .isString().bail()
    .custom((v) => /^\/uploads\/[\w.-]{1,200}$/.test(v) || /^https?:\/\/\S{1,480}$/.test(v))
    .withMessage(`${label} must be an uploaded file or a full URL.`);

const optInt = (field, label, min, max) =>
  body(field).optional({ values: 'null' }).if((v) => v !== '')
    .isInt({ min, max }).withMessage(`${label} must be a whole number between ${min} and ${max}.`).toInt();

const optBool = (field) => body(field).optional().toBoolean();

const stringArray = (field, label, maxItems, maxLen) => [
  body(field).optional().isArray({ max: maxItems }).withMessage(`${label} can have at most ${maxItems} items.`),
  body(`${field}.*`).isString().withMessage(`${label} items must be text.`).bail()
    .customSanitizer(stripHtml)
    .isLength({ min: 1, max: maxLen }).withMessage(`Each ${label.toLowerCase()} item must be 1–${maxLen} characters.`),
];

exports.login = [
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail({ gmail_remove_dots: false }),
  body('password').isString().notEmpty().withMessage('Enter your password.').isLength({ max: 200 }),
];

exports.changePassword = [
  body('currentPassword').isString().notEmpty().withMessage('Enter your current password.'),
  body('newPassword').isString().isLength({ min: 10, max: 100 }).withMessage('New password must be 10–100 characters.'),
];

exports.contact = [
  reqText('name', 'Name', 100, 2),
  body('email').isString().bail().trim().isEmail().withMessage('Enter a valid email address.').bail()
    .isLength({ max: 190 }).withMessage('Email must be 190 characters or fewer.').normalizeEmail({ gmail_remove_dots: false }),
  reqText('subject', 'Subject', 160, 3),
  reqText('message', 'Message', 3000, 10),
];

exports.portfolio = [
  presentText('name', 'Name', 120),
  presentText('headline', 'Headline', 240),
  optText('intro', 'Intro', 600),
  optText('bio', 'Bio', 5000),
  optAsset('profile_image', 'Profile image'),
  optAsset('resume_url', 'Resume'),
  body('public_email').optional({ values: 'falsy' }).isEmail().withMessage('Enter a valid email address.'),
  optText('location', 'Location', 120),
  optText('developer_focus', 'Developer focus', 2000),
  optText('current_focus', 'Current focus', 500),
  body('education').optional().isArray({ max: 10 }).withMessage('Education can have at most 10 entries.'),
  body('education.*.degree').isString().bail().customSanitizer(stripHtml).isLength({ min: 1, max: 200 }).withMessage('Each education entry needs a degree or title.'),
  body('education.*.institution').isString().bail().customSanitizer(stripHtml).isLength({ min: 1, max: 200 }).withMessage('Each education entry needs an institution.'),
  body('education.*.period').optional({ values: 'falsy' }).isString().customSanitizer(stripHtml).isLength({ max: 60 }),
  body('education.*.details').optional({ values: 'falsy' }).isString().customSanitizer(stripHtml).isLength({ max: 500 }),
  ...stringArray('achievements', 'Achievements', 15, 300),
];

exports.settings = [
  optText('site_title', 'Site title', 120),
  optText('meta_description', 'Meta description', 300),
  optText('availability_text', 'Availability text', 120),
];

exports.skill = [
  reqText('name', 'Name', 80),
  reqText('category', 'Category', 80),
  optText('icon', 'Icon', 60),
  optInt('level', 'Level', 0, 100),
  optInt('display_order', 'Order', 0, 100000),
  optBool('enabled'),
];

exports.social = [
  reqText('platform', 'Platform', 40),
  reqText('label', 'Label', 80),
  body('url').isString().bail().trim().custom((v) => /^(https?:\/\/|mailto:)\S+$/.test(v) && v.length <= 500)
    .withMessage('Enter a full URL (https://…) or a mailto: link.'),
  optInt('display_order', 'Order', 0, 100000),
  optBool('enabled'),
];

exports.project = [
  reqText('name', 'Project name', 120),
  reqText('short_description', 'Short description', 300),
  optText('slug', 'Slug', 120),
  optText('description', 'Description', 8000),
  optText('problem', 'Problem statement', 4000),
  optText('solution', 'Solution', 4000),
  optText('architecture', 'Architecture', 4000),
  optText('challenges', 'Challenges', 4000),
  optText('engineering_decisions', 'Engineering decisions', 4000),
  optAsset('cover_image', 'Cover image'),
  optUrl('github_url', 'GitHub URL'),
  optUrl('live_url', 'Live demo URL'),
  optBool('featured'),
  optInt('display_order', 'Order', 0, 100000),
  optInt('year', 'Year', 1990, 2100),
  ...stringArray('features', 'Features', 30, 300),
  ...stringArray('highlights', 'Highlights', 30, 300),
  body('technologies').optional().isArray({ max: 40 }).withMessage('Add at most 40 technologies.'),
  body('technologies.*').isString().bail().customSanitizer(stripHtml).isLength({ min: 1, max: 60 }).withMessage('Each technology must be 1–60 characters.'),
  body('images').optional().isArray({ max: 20 }).withMessage('Add at most 20 screenshots.'),
  body('images.*.url').isString().bail().custom((v) => /^\/uploads\/[\w.-]{1,200}$/.test(v) || /^https?:\/\/\S{1,480}$/.test(v)).withMessage('Invalid screenshot URL.'),
  body('images.*.caption').optional({ values: 'falsy' }).isString().customSanitizer(stripHtml).isLength({ max: 200 }),
];
