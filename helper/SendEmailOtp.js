const generateOtp = require('otp-generator')
const { OTP } = require("../models/OtpModel");
const { sendMail } = require("../services/SendEmail");
const { emailOtp } = require('../emailTemplate/EmailOtp');

const handleSendEmailOtp = async (data) => {
    const {email,name}=data;
    try {
        if (!email) {
            return { success:false,message: "Please provide an email!" }
        }
        else {
            // check that email is present in the otp model
            const isEmail = await OTP.findOne({ email });
            // if email is present:
            if (isEmail) {
                return { success: false, message: "try after 5 minutes." };
            }
            else {
                // generate otp
                const otp = generateOtp.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
                const newOtp = await OTP.create({ otpCode: otp, email: email });
                if (!newOtp) {
                    return { success: false, message: "OTP not Send" };
                }
                else {
                    const otpData = { ...newOtp.toObject(), name: name };
                    const result = await sendMail(otpData,emailOtp );
                    if (!result.success) {
                        return { success: false, message: "OTP has not been Sent" };
                    } else {
                        return { success: true, message: "OTP has been Sent" };
                    }
                }
            }
        }
    } catch (error) {
        return { success: false, message: error.message};
    }
}

module.exports={
    handleSendEmailOtp,
}