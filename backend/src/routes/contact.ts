import express from 'express';
import { validateRequiredFields, validateEmail } from '../middleware/validation';
import { sendContactEmail } from '../services/emailService';
import { handleError, ErrorCreators } from '../utils/errorHandler';
import { contactLimiter } from '../middleware/rateLimiter';

const router = express.Router();

/**
 * POST /api/contact
 * Submit contact form
 * @body {string} name - Contact name
 * @body {string} email - Contact email
 * @body {string} subject - Message subject
 * @body {string} message - Message content
 * @returns {Object} Success message
 */
router.post(
  '/',
  contactLimiter,
  validateRequiredFields(['name', 'email', 'subject', 'message']),
  validateEmail('email'),
  async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      // Validate message length
      if (message.length < 10) {
        throw ErrorCreators.validationError('Message must be at least 10 characters');
      }

      if (message.length > 5000) {
        throw ErrorCreators.validationError('Message must be less than 5000 characters');
      }

      // Send contact email
      await sendContactEmail(name, email, subject, message);

      res.status(200).json({
        message: 'Thank you for your message! We\'ll get back to you soon.',
      });
    } catch (error) {
      handleError(error, res, 'Failed to send contact message');
    }
  }
);

export default router;

