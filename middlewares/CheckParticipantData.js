// chatValidation.js

const { body } = require('express-validator');

const participantValidation = [
    body('chatType')
        .notEmpty()
        .withMessage('Chat type is required.')
        .isIn(['one-to-one', 'group'])
        .withMessage('Invalid chat type. Valid values: "one-to-one", "group"'),

    body('groupChatName')
        .if((value, { req }) => req.body.chatType === 'group')
        .notEmpty()
        .withMessage('Group chat name is required for group chats.'),

    body('groupChatAdmins')
        .if((value, { req }) => req.body.chatType === 'group')
        .custom((value, { req }) => {
            if (!value || value.length === 0) {
                throw new Error('Group chats must have at least one admin.');
            }
            return true;
        }),

    body('chatParticipants')
        .notEmpty()
        .withMessage('Chat participants are required.')
        .custom((value, { req }) => {
            if (value.length < 2) {
                throw new Error('A chat must have at least 2 participants.');
            }
            return true;
        }),
];

module.exports = participantValidation;
// DONE ->TETSING PENDING