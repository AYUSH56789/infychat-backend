const { generateToken, verifyToken } = require('../../services/AuthToken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { User } = require('../../models/UserModel');
const { sendMail } = require('../../services/SendEmail');
const { handleSendEmailOtp } = require('../../helper/SendEmailOtp');
const { VerifySignUpEmailOtp } = require('../../helper/VerifySignUpEmailOtp');
const { welcomeEmail } = require('../../emailTemplate/WelcomeEmail');
const path = require('path');
const { uploadOnCloudinary } = require('../../services/Cloudinary.js');

// Tag: done
const handleSignUpRoute = async (req, res) => {
    try {
        //check is any error in the data send from client side
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(422).json({ status: 422,success:false, message:"Inavlid Input", errors: error.array() });
        }
        // check user is exist or not.
        else {
            // extract user details from request
            const { name, email, password, mobileNumber } = req.body;
            // extract file from request
            const file = req.file;
            const photoData=await uploadOnCloudinary(file.path,'profilePhoto',email); //upload on cloud
            // console.log(photoData)
            // check if data is not upload on the cloudnary than run than end this controller
            if (!photoData.publicId && !photoData.url) {
                return res.status(500).json({ status: 500,success:false, message: 'Data not uplaod on cloudnary' });
            }
            // check user
            const userExist = await User.findOne({
                $or: [
                    { email: email },
                    { mobileNumber: mobileNumber }
                ]
            });
            if (userExist) {
                if (userExist.status === 'active') {
                    return res.status(400).json({ status: 400,success:false, message: 'User Already Exist.' });
                }
                else if (userExist.status === 'inactive') {
                    return res.status(500).json({ status: 500,success:false, message: 'Please Try After Sometime.' });
                }
            }
            // create new user
            else {

                // generate  a salt and hash the password using that salt
                const salt = await bcrypt.genSalt(10);
                const securePassword = await bcrypt.hash(password, salt)
                // create  user
                const newUser = await User.create({
                    name: name,
                    email: email,
                    password: securePassword,
                    mobileNumber: mobileNumber,
                    photo:photoData,
                });

                // set user _id as cookie
                const signupToken = generateToken(newUser, process.env.USER_VERIFICATION_SECRET_KEY)
                // calculate expiry
                const expirationTime = new Date();
                expirationTime.setTime(expirationTime.getTime() + parseInt(process.env.USER_TOKEN_EXPIRATION_TIME)); // Add expiration time from environment variable

                res.cookie("userToken", signupToken, {
                    expires: expirationTime,
                    httpOnly: process.env.COOKIE_HTTP_ONLY, // Ensures cookie is only accessible via HTTP(S)
                    secure: process.env.COOKIE_SECURE // Ensures cookie is only sent over HTTPS
                });

                // send email otp
                const sendOtp = await handleSendEmailOtp(newUser);
                if (!sendOtp.success) {
                    return res.status(400).json({ status: 400,success:false, message:"hlo"+ sendOtp.message });
                } else {
                    return res.status(200).json({ status: 200,success:true, message: sendOtp.message, user: newUser });
                }
            }
        }
    } catch (error) {
        res.status(500).json({ status: 500,success:false, message: "Internal Server Error", error: error.message })
    }
}

const handleVerifySignUpEmailOtp = async (req, res) => {
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
                        const isVerify = await VerifySignUpEmailOtp(data);
                        if (!isVerify.success) {
                            return res.status(400).json({ status: 400,success:false, message: isVerify.message });
                        }
                        else {
                            const welcomeData = {
                                name: isUserExist.name,
                                email: isUserExist.email
                            }
                            const isSend = await sendMail(welcomeData, welcomeEmail);
                            if (!isSend.success) {
                                return res.status(400).json({ status: 400,success:false, message: `${isVerify.message} ,but greeting not send. ` });
                            } else {
                                return res.status(200).json({ status: 200,success:true, message: `${isVerify.message} ` });
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
}

module.exports = {
    handleSignUpRoute,
    handleVerifySignUpEmailOtp,
}