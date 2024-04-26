const { body, oneOf } = require("express-validator");

const EmailValidation = [
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
        .isEmail().withMessage("Please enter a valid email address.")
        .isString() ,
];

module.exports = {
    EmailValidation,
};
