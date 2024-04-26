const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    messageType: {
        type: String,
        // required: true,
        enum: ['text', 'file'],  // Valid message types
        default:'text'
    },
    messageContent: {
        type: String,
        required: function () {
            return this.messageType === 'text';
        },
        // Set content based on message type
        default: null
    },
    attachment: [{
        publicId: {
            type: String,
            required: function () {
                return this.messageType === 'file';
            },
            default: null
        },
        url: {
            type: String,
            required: function () {
                return this.messageType === 'file';
            },
            default: null,
        }
    },
    ],
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Chat",  // Reference to the Chat document
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"  // Reference to the User document
    },
    seenBy: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: []  // Empty array by default
    }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

module.exports = {
    Message,
};
