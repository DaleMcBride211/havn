import { body } from 'express-validator';

const contactValidation = [
  body('subject')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Subject must be between 2 and 255 characters')
    .matches(/^[a-zA-Z0-9\s\-.,!?]+$/)
    .withMessage('Subject contains invalid characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
    .custom((value) => {
      // Check for spam patterns (excessive repetition)
      const words = value.split(/\s+/);
      const uniqueWords = new Set(words);
      if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
        throw new Error('Message appears to be spam');
      }
      return true;
    })
];


// utilities/forms.js (Add this to your existing content)
const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .isLength({ max: 255 })
        .withMessage('Email address is too long')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
];

const registrationValidation = [
    body('firstName') // Matches the 'firstName' in your console log
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('First name contains invalid characters'),
    
    body('lastName') // Matches the 'lastName' in your console log
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Last name contains invalid characters'),

    body('phone')
        .optional({ checkFalsy: true })
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),

    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address'),
    body('emailConfirm')
        .trim()
        .custom((value, { req }) => value === req.body.email)
        .withMessage('Email addresses must match'),
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least on uppercase letter')
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
        .withMessage('Password must contain at least one special character'),
    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords must match')
];

const updateAccountValidation = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name contains invalid characters'),
    
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name contains invalid characters'),

    body('email')
        .trim()
        .isEmail().withMessage('Must be a valid email address')
        .isLength({ max: 255 }).withMessage('Email address is too long')
        .normalizeEmail(), 

    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^(\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/)
        .withMessage('Please enter a valid phone number')
];

const maintenanceUpdateValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),

  body('priority')
    .isIn(['low', 'medium', 'high', 'emergency'])
    .withMessage('Please select a valid priority level'),

  body('status')
    .isIn(['new', 'in_progress', 'on_hold', 'completed', 'cancelled'])
    .withMessage('Please select a valid status'),

  body('cost')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number')
    .customSanitizer(value => value || 0) // Defaults to 0 if empty string provided
];

const maintenanceCreateValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Issue summary is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Summary must be between 5 and 100 characters'),

  body('unitId')
    .notEmpty()
    .withMessage('Please select a unit')
    .isInt()
    .withMessage('Invalid unit selection'),

  body('priority')
    .isIn(['low', 'medium', 'high', 'emergency'])
    .withMessage('Please select a valid priority level'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Detailed description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
];


export { 
    contactValidation, 
    registrationValidation, 
    loginValidation,
    updateAccountValidation,
    maintenanceUpdateValidation,
    maintenanceCreateValidation
};