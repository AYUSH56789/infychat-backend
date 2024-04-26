const { body } = require("express-validator");

const SignUpValidation = [
    body('name')
        .notEmpty().withMessage('Name is required.')
        .isLength({ min: 3, max: 30 }).withMessage('Name must be between 3 and 30 characters long.'),
    body('email')
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage("Please enter a valid email address."),
    body('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({ min: 6, max:15}).withMessage('Password must be at least 6 characters long.'),
    body('mobileNumber')
        .notEmpty().withMessage('Mobile number is required.').isMobilePhone().withMessage('Please enter a valid mobile number.'),
    // body('language')
    //     .optional()
    //     .isIn(['english', 'french', 'spanish']).withMessage('Please select a valid language.'),
    // body('mpin')
    //     .optional()
    //     .isNumeric().withMessage('MPIN must contain only numbers.')
    //     .isLength({ min: 4 , max:8}).withMessage('MPIN must be between 4 and 8 characters long.'),
    // body('photo')
    //     .optional()
    //     .isLength({ max: 255 }).withMessage('Photo URL must be less than or equal to 255 characters.'),
];

module.exports = {
    SignUpValidation
};
