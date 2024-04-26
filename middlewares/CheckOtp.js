const { body } = require("express-validator");

const OtpValidation = [
    body('otp')
    .notEmpty().withMessage('otp is required.')
    .isLength({ min: 6, max:6,}).withMessage('otp must be 6 characters long.'),
];

module.exports = {
    OtpValidation
};
