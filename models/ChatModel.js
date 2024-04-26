// chatModel.js

const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    chatType: {
        type: String,
        required: true,
        enum: ['one-to-one', 'group']
    },
    groupChatName: {
        type: String,
        required: function(){
            return this.chatType === 'group';
        },
        default: null,
        unique:function(){
            return this.chatType === 'group';
        },
    },
    groupChatImage: {
        type: String,
        optional:true,
        default: null
    },
    groupChatCreator:{
        type: mongoose.Types.ObjectId,
        ref:'User',
        required: function(){
            return this.chatType === 'group';
        },
        default:null
    },
    groupChatAdmins: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        validate: {
            validator: function (v) {
                if (this.chatType === 'group') {
                    return v.length > 0;
                } else {
                    return true;
                }
            },
            message: 'Group chats must have at least one admin.'
        },
        required: function(){
            return this.chatType === 'group';
        },
        default: null
    },
    chatParticipants: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        validate: {
            validator: function (v) {
                return v.length > 1;
            },
            message: 'A chat must have at least 2 participants.'
        },
        required: true,
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default:null
    },
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = {
    Chat
}

// DONE ->TETSING PENDING