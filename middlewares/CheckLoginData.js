const { body, oneOf } = require("express-validator");

const LoginValidation = [
    // oneOf([
    //     body('email')
    //         .notEmpty().withMessage('Email is required.')
    //         .isEmail().withMessage("Please enter a valid email address."),
    //     body('mobileNumber')
    //         .notEmpty().withMessage('Mobile number is required.')
    //         .isMobilePhone().withMessage('Please enter a valid mobile number.')
    // ], { message: 'Please provide either email or mobile number' }),
    body('email')
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage("Please enter a valid email address."),
    body('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({ min: 6, max: 15 }).withMessage('Password must be between 6 and 15 characters long.')
];

module.exports = {
    LoginValidation
};
