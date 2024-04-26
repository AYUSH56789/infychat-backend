const express = require('express');
const { SignUpValidation } = require('../middlewares/CheckSignUpData');
const { LoginValidation } = require('../middlewares/CheckLoginData');
const { EmailValidation } = require('../middlewares/CheckEmail');
const { OtpValidation } = require('../middlewares/CheckOtp');
const { PasswordValidation } = require('../middlewares/CheckPassword');
const { handleLoginRoute } = require('../controllers/authController/LoginController');
const { handleVerifySignUpEmailOtp, handleSignUpRoute } = require('../controllers/authController/SignupController');
const { handleForgetCheckUser, handleVerifyForgetEmailOtp, handleForgetPassword } = require('../controllers/authController/ForgetController');
const { handleLogout } = require('../controllers/authController/Logout');
const { upload } = require('../middlewares/multerMiddleware');

const authRouter = express.Router();

// ROUTES:
authRouter.post('/login', LoginValidation, handleLoginRoute);
authRouter.post('/signup',[upload.single('photo'), SignUpValidation], handleSignUpRoute);
// authRouter.post('/signup',upload.single('photo'), handleSignUpRoute);
authRouter.post('/signup/verify-user', OtpValidation , handleVerifySignUpEmailOtp);
authRouter.post('/forget/check-user', EmailValidation , handleForgetCheckUser);
authRouter.post('/forget/verify-user', OtpValidation , handleVerifyForgetEmailOtp);
authRouter.post('/forget-password',PasswordValidation, handleForgetPassword);
authRouter.post('/logout', handleLogout);


module.exports = {
    authRouter,
}
