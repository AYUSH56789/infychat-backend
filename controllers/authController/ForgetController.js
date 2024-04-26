const { generateToken, verifyToken } = require('../../services/AuthToken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { User } = require('../../models/UserModel');
const { sendMail } = require('../../services/SendEmail');
const { handleSendEmailOtp } = require('../../helper/SendEmailOtp');
const { VerifyForgetEmailOtp } = require('../../helper/VerifyForgetEmailOtp');

// tag :"complete" check user
const handleForgetCheckUser = async (req, res) => {
    try {
        //check is any error in the data send from client side
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ status: 422, success:false, message:"Inavlid Input", errors: errors.array() });
        }
        else {
            const { email } = req.body;
            // check user is exist or not
            const isExist = await User.findOne({ email });

            // if not exist
            if (!isExist) {
                return res.status(400).json({ status: 400, success: 'false', message: "User Not Exist" });
            }
            // if exist
            else {
                // set user _id as cookie
                const forgetToken = generateToken(isExist, process.env.USER_VERIFICATION_SECRET_KEY)
                // calculate expiry
                const expirationTime = new Date();
                expirationTime.setTime(expirationTime.getTime() + parseInt(process.env.USER_TOKEN_EXPIRATION_TIME)); // Add expiration time from environment variable

                res.cookie("userToken", forgetToken, {
                    expires: expirationTime,
                    httpOnly: process.env.COOKIE_HTTP_ONLY, // Ensures cookie is only accessible via HTTP(S)
                    secure: process.env.COOKIE_SECURE // Ensures cookie is only sent over HTTPS
                });
                //send otp to email
                const sendOtp = await handleSendEmailOtp(isExist);
                if (!sendOtp.success) {
                    return res.status(400).json({ status: 400,success:false, message: sendOtp.message });
                } else {
                    return res.status(200).json({ status: 200,success:true, message: sendOtp.message });
                }
            }
        }
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
}

// tag :"complete" otp verification
const handleVerifyForgetEmailOtp = async (req, res) => {
    try {
        //check is any error in the data send from client side
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ status: 422,success:false, message:"Inavlid Input", errors: errors.array() });
        }
        else {
            const token = req.cookies.userToken;
            if (!token) {
                // if no token
                return res.status(400).json({ status: 400, success: false, message: "Token missing in cookies" });
            }
            else {
                // if token
                const payload = verifyToken(token, process.env.USER_VERIFICATION_SECRET_KEY);
                if (!payload) {
                    return res.status(400).json({ status: 400, success: false, message: "Invalid Token" });
                } else {
                    const userId = payload._id;
                    const isUserExist = await User.findById(userId);
                    if (!isUserExist) {
                        return res.status(404).json({ status: 404, success: false, message: "User Not Found" });
                    }
                    else {
                        const { otp } = req.body;
                        const data = {
                            otp: otp,
                            email: isUserExist.email
                        }
                        const isVerify = await VerifyForgetEmailOtp(data);
                        if (isVerify.success) {
                            return res.status(200).json({ status: 200,success:isVerify.success, message: isVerify.message });
                        }
                        else {
                            return res.status(400).json({ status: 400,success:false, message: isVerify.message });
                        }
                    }
                }
            }
        }
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
}

// Tag: "complete" password change
const handleForgetPassword = async (req, res) => {
    try {
        //check is any error in the data send from client side
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ status: 422,success:false, message:"Inavlid Input",errors: errors.array() });
        }
        else {
            const token = req.cookies.userToken;
            if (!token) {
                // if no token
                return res.status(400).json({ status: 400, success: false, message: "Token missing in cookies" });
            }
            else {
                // if token
                const payload = verifyToken(token, process.env.USER_VERIFICATION_SECRET_KEY);
                if (!payload) {
                    return res.status(400).json({ status: 400, success: false, message: "Invalid Token" });
                } else {
                    const userId = payload._id;
                    const { newPassword } = req.body;
                    // update password
                    const salt = await bcrypt.genSalt(10);
                    const securePassword = await bcrypt.hash(newPassword, salt);
                    const updatePassword = await User.findOneAndUpdate(
                        { _id: userId },
                        { password: securePassword }
                    )
                    if (!updatePassword) {
                        return res.status(404).json({ status: 404, success: false, message: "User Not Found" });
                    }
                    else {
                        return res.status(200).json({ status: 200, success: true, message: 'Password Changed successflly.' });
                    }
                }
            }
        }
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
}

module.exports = {
    handleForgetCheckUser,
    handleVerifyForgetEmailOtp,
    handleForgetPassword,
}