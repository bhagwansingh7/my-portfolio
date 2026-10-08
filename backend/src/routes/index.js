const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const v = require('../middleware/validators');
const { protect, optionalAuth, authenticate } = require('../middleware/auth');
const { loginLimiter, contactLimiter } = require('../middleware/rateLimiters');
const { upload } = require('../middleware/upload');

const auth = require('../controllers/authController');
const portfolio = require('../controllers/portfolioController');
const skills = require('../controllers/skillsController');
const projects = require('../controllers/projectsController');
const social = require('../controllers/socialLinksController');
const contact = require('../controllers/contactController');
const messages = require('../controllers/messagesController');
const uploads = require('../controllers/uploadsController');
const stats = require('../controllers/statsController');

const id = param('id').isInt({ min: 1 }).withMessage('Invalid id.').toInt();
const slugOrId = param('id').matches(/^[\w-]{1,120}$/).withMessage('Invalid id.');

// ---- Auth ----
router.post('/auth/login', loginLimiter, v.login, validate, auth.login);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', authenticate, auth.me);
router.put('/auth/password', protect, v.changePassword, validate, auth.changePassword);

// ---- Portfolio (About) + settings ----
router.get('/portfolio', portfolio.getPortfolio);
router.put('/portfolio', protect, v.portfolio, validate, portfolio.updatePortfolio);
router.get('/settings', portfolio.getPublicSettings);
router.put('/settings', protect, v.settings, validate, portfolio.updateSettings);

// ---- Skills ----
router.get('/skills', optionalAuth, skills.list);
router.put('/skills/reorder', protect, body('ids').isArray({ min: 1, max: 500 }), validate, skills.reorder);
router.post('/skills', protect, v.skill, validate, skills.create);
router.put('/skills/:id', protect, id, v.skill, validate, skills.update);
router.delete('/skills/:id', protect, id, validate, skills.remove);

// ---- Projects ----
router.get('/projects', projects.list);
router.get('/projects/:id', slugOrId, validate, projects.getOne);
router.post('/projects', protect, v.project, validate, projects.create);
router.put('/projects/:id', protect, id, v.project, validate, projects.update);
router.delete('/projects/:id', protect, id, validate, projects.remove);

// ---- Social links ----
router.get('/social-links', optionalAuth, social.list);
router.post('/social-links', protect, v.social, validate, social.create);
router.put('/social-links/:id', protect, id, v.social, validate, social.update);
router.delete('/social-links/:id', protect, id, validate, social.remove);

// ---- Contact (public) + messages (admin) ----
router.post('/contact', contactLimiter, v.contact, validate, contact.create);
router.get('/messages', protect, messages.list);
router.put('/messages/:id/read', protect, id, validate, messages.markRead);
router.put('/messages/:id/unread', protect, id, validate, messages.markUnread);
router.put('/messages/:id/archive', protect, id, validate, messages.archive);
router.delete('/messages/:id', protect, id, validate, messages.remove);

// ---- Uploads + stats (admin) ----
router.post('/uploads', protect, upload, uploads.create);
router.get('/stats', protect, stats.get);

module.exports = router;
