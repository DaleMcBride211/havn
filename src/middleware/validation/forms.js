import { body } from 'express-validator';

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


const contactValidation = [
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
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^(\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/)
    .withMessage('Please enter a valid phone number'),

  body('subject')
    .trim()
    .notEmpty().withMessage('Please select a subject')
    .isIn(['General Inquiry', 'Leasing', 'Maintenance', 'Management'])
    .withMessage('Invalid subject selected'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 2, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
    .custom((value) => {
      // Your existing spam check logic
      const words = value.split(/\s+/);
      const uniqueWords = new Set(words);
      if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
        throw new Error('Message appears to be spam');
      }
      return true;
    }),
    
  body('property_id')
    .optional({ checkFalsy: true })
    .isInt().withMessage('Invalid property reference')
];

const propertyCreateValidation = [
    // --- 1. Base Property Fields ---
    body('name')
        .trim()
        .notEmpty().withMessage('Property name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

    body('address')
        .trim()
        .notEmpty().withMessage('Street address is required')
        .isLength({ min: 5, max: 200 }).withMessage('Please provide a valid street address'),

    body('city')
        .trim()
        .notEmpty().withMessage('City is required')
        .isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters'),

    body('state')
        .trim()
        .notEmpty().withMessage('State is required')
        .isLength({ min: 2, max: 2 }).withMessage('State must be exactly 2 characters (e.g., CA)')
        .toUpperCase(), // Automatically capitalizes 'ca' to 'CA'

    body('zip')
        .trim()
        .notEmpty().withMessage('Zip code is required')
        .matches(/^\d{5}$/).withMessage('Zip code must be exactly 5 digits'),

    body('type')
        .notEmpty().withMessage('Property type is required')
        .isIn(['apartment_building', 'house']).withMessage('Please select a valid property type'),

    // --- 2. House Fields (Only validated if type === 'house') ---
    body('bedrooms')
        .if(body('type').equals('house'))
        .notEmpty().withMessage('Bedrooms are required for a house')
        .isInt({ min: 0 }).withMessage('Bedrooms must be 0 or a positive number'),

    body('bathrooms')
        .if(body('type').equals('house'))
        .notEmpty().withMessage('Bathrooms are required for a house')
        .isFloat({ min: 0 }).withMessage('Bathrooms must be 0 or a positive number'),

    body('sq_ft')
        .if(body('type').equals('house'))
        .notEmpty().withMessage('Square footage is required')
        .isInt({ min: 1 }).withMessage('Square footage must be a positive number'),

    body('market_rent')
        .if(body('type').equals('house'))
        .notEmpty().withMessage('Monthly rent is required')
        .isFloat({ min: 0 }).withMessage('Rent must be a positive number'),

    // --- 3. Apartment Fields (Only validated if type === 'apartment_building') ---
    // We use a custom validator here because the incoming data could be a String (1 row) or an Array (2+ rows)
    body('multi_unit_number')
        .if(body('type').equals('apartment_building'))
        .custom((value) => {
            if (!value) throw new Error('At least one unit must be added to the apartment building');
            
            // Force to array to check everything
            const units = Array.isArray(value) ? value : [value];
            if (units.some(u => u.trim() === '')) {
                throw new Error('All units must have a unit number');
            }
            return true;
        }),

    body('multi_market_rent')
        .if(body('type').equals('apartment_building'))
        .custom((value) => {
            if (!value) return true; // Handled by unit number check above
            
            const rents = Array.isArray(value) ? value : [value];
            if (rents.some(r => isNaN(parseFloat(r)) || parseFloat(r) < 0)) {
                throw new Error('All apartment units must have a valid positive rent amount');
            }
            return true;
        })
];

export { 
    contactValidation, 
    registrationValidation, 
    loginValidation,
    updateAccountValidation,
    maintenanceUpdateValidation,
    maintenanceCreateValidation,
    propertyCreateValidation
};