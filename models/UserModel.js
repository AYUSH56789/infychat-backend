const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        maxlength: 30,
        required: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    password: {
        type: String,
        require: true,
    },
    mobileNumber: {
        type: Number,
        require: true,
        unique: true,
    },
    photo: {
        publicId: {
            type: String,
            default: null
        },
        url: {
            type: String,
            default: null
        }
    },
    language: {
        type: String,
        default: "english",

    },
    status: {
        type: String,
        default: "inactive",

    },
    isVerify: {
        type: String,
        default: "false",

    },
    mpin: {
        type: Number,
        reuired: null,
        default: null
    },
    role: {
        type: String,
        enum: ["normal", "admin"],
        default: "normal"
    }
}, { timestamps: true })

const User = mongoose.model('User', UserSchema);

module.exports = {
    User
}