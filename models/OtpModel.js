const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true // Ensure uniqueness for each phone number
    },
    otpCode: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // Automatically delete document after 5 minutes (180 seconds)
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    usedAt: {
        type: Date,
        default: null
    }
});

const OTP=mongoose.model('OTP',otpSchema);
module.exports={
    OTP
}