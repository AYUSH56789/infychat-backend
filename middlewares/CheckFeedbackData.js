const { body, oneOf } = require("express-validator");

const FeedbackValidation = [
    body('feedbackUserName')
        .notEmpty().withMessage('Name is required.')
        .isLength({min:3, max:20}).withMessage('Name must be between 3 to 10 charcater.'),
    body('feedbackUseremail')
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage("Please enter a valid email address.")
        .isString() ,
    body('feedbackUserMobileNumber')
        .notEmpty().withMessage('mobile number is required.')
        ,
    body('feedbackMessage')
        .notEmpty().withMessage('Please Provide Feedback Message.')
        .isLength({min:10,max:255}).withMessage("Please enter a valid email address.") ,
];

module.exports = {
    FeedbackValidation,
};
