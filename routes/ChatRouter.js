const express = require('express');
const { validationResult } = require('express-validator');
const participantValidation = require('../middlewares/CheckParticipantData');
const { Message } = require('../models/MessageModel');
const { Chat } = require('../models/ChatModel');
const { User } = require('../models/UserModel');
const { handleGetParticipants, handleAddOneToOneChat } = require('../controllers/chatController/ParticipantController');
const { handleCreateGroup, handleAddGroupMember, handleRemoveGroupMember, handleLeaveGroup, handleSendAttachments, handleGroupRename, handleDeleteChat, handleDeleteMesage, handleSearchUser, handleSearchFriend, handleSearchAllUser, handleUserDetail, handleGroupDetail, handleFriendDetail, handleDeleteUser, handleGetChatDetail } = require('../controllers/chatController/GroupController');
const { handleGetMessages } = require('../controllers/chatController/MessageController');
const fs = require('fs');
const { attachments } = require('../middlewares/multerMiddleware');
const { handleCustomGemniChatBot } = require('../controllers/chatBot/customGemni');
const chatRouter = express.Router();
// all api


// 1. get all chat participant of login user
chatRouter.get('/participant', handleGetParticipants ); //// done [fully working]

// 2. create group-chat of login user
chatRouter.post('/create-group',handleCreateGroup); // pending -> it working ,but may need to optimise the code

// 3. get all chat of specific participant of user
chatRouter.post('/get-message',handleGetMessages); //[done( testig->done [but need to optimise])]

// 4. create chat of specific participant of user
chatRouter.post('/create-oneToOneChat',handleAddOneToOneChat);  //[done(testing->done [but need to optimise])]

// 5. add participant in group.
chatRouter.put('/add-member',handleAddGroupMember); // tetsing [done]

//  6. remove participant in group
chatRouter.put('/remove-member',handleRemoveGroupMember); // tetsing [done]

//  7. leave participant in group
chatRouter.delete('/leave-group',handleLeaveGroup); // tetsing [done]

//  8. add new admin in group
// chatRouter.put('/add-admin',handleAddAdmin); //  pending

// 9.send attachments
chatRouter.post('/send-attachments',attachments.array('files',5),handleSendAttachments); // testing[done]

// 10. rename-group
chatRouter.put("/group-rename",handleGroupRename) //done

// 11. delete chat message
chatRouter.delete("/delete-message",handleDeleteMesage) //pending->no code

// 12. delete chat 
chatRouter.delete("/delete-chat",handleDeleteChat); //done

// 13. search user 
chatRouter.get("/search-user",handleSearchUser);//done

// 14. search user  friend
chatRouter.get("/search-friend",handleSearchFriend);//done

// 15. search all user 
chatRouter.get("/search-all-user",handleSearchAllUser);//done

// 16. get user detail
chatRouter.get("/user-details",handleUserDetail)

// 17. get user group detail
chatRouter.post("/group-details",handleGroupDetail);

// 18. get friend detail
chatRouter.post("/friend-details",handleFriendDetail);

// 19. get friend detail
chatRouter.delete("/delete-user",handleDeleteUser);

// 20. get chat detail
chatRouter.post("/chat-details",handleGetChatDetail);

chatRouter.post('/chatBoat/text',handleCustomGemniChatBot);

// 20. get chat detail
chatRouter.post("/msg-schedule", (req, res) => {
    const { scheduleMessage, scheduleDate, scheduleTime ,chatId,members,sender} = req.body;

    // Construct message object
    const message = {
        chatId,
        members,
        scheduleMessage,
        scheduleDate,
        scheduleTime,
        sender
    };

    // Check if file exists
    fs.access('messages.json', fs.constants.F_OK, (err) => {
        if (err) {
            // File does not exist, create it with an empty array
            fs.writeFile('messages.json', '[]', 'utf8', (err) => {
                if (err) {
                    console.error('Error creating file:', err);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }
                // Append message to the newly created file
                appendMessageToFile(message, res);
            });
        } else {
            // File exists, append message to it
            appendMessageToFile(message, res);
        }
    });
});

function appendMessageToFile(message, res) {
    // Read existing messages from file
    fs.readFile('messages.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        let messages = [];
        try {
            // Parse existing messages if the file is not empty
            if (data.trim() !== '') {
                messages = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error parsing JSON:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Add new message to messages array
        messages.push(message);

        // Write updated messages array back to file
        fs.writeFile('messages.json', JSON.stringify(messages), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            // Send success response
            res.status(200).json({ message: 'Message scheduled successfully' });
        });
    });
}


// pending rooutes
/* 
 edit message
 forward message
 schedule message
 */
 

module.exports = {
    chatRouter
}
