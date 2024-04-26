const { body } = require("express-validator");

const PasswordValidation = [
    body('newPassword')
        .notEmpty().withMessage('Password is required.')
        .isLength({ min: 6, max:15}).withMessage('Password must be at least 6 characters long.'),
];

module.exports = {
    PasswordValidation
};
