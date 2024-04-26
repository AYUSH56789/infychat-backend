const { OTP } = require("../models/OtpModel");
const { User } = require("../models/UserModel");
const { sendMail } = require("../services/SendEmail");

const VerifyForgetEmailOtp = async (data) => {
    try {
        const { email, otp } = data;
        if (!email || !otp) {
            return { success: false, message: "Bad Request" }
        }
        else {
            // check for that email is exist or not
            const isEmailExist = await OTP.findOne({ email });
            // if email not exist in db
            if (!isEmailExist) {
                return { success: false, message: "Bad Request" }
            }
            else {
                if (isEmailExist.usedAt) {
                    return { success: false, message: "Invalid OTP ." };
                }
                else {
                    // verify otp
                    if (otp === isEmailExist.otpCode) {

                        // update otp status
                        const updateOtpData = await OTP.findOneAndUpdate(
                            { email: isEmailExist.email },
                            { isUsed: true, usedAt: Date.now() }
                        );
                        return { success: true, message: "OTP verification successfull." };
                    }
                    else {
                        return { success: false, message: "OTP verification unsuccessfull." };
                    }
                }
            }
        }
    }
    catch (error) {
        console.error("Error occurred while updating OTP status:", error);
        return { success: false, message: "OTP verification unsuccessfull" };
    }
}

module.exports = {
    VerifyForgetEmailOtp,
}