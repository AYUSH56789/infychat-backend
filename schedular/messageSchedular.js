// schedular/messageSchedular.js

const fs = require('fs');
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const { Message } = require('../models/MessageModel');
const { Chat } = require('../models/ChatModel');
const { getSockets } = require('../helper/GetSockets');

let io; // Define io variable to hold the Socket.IO instance

// Function to set the Socket.IO instance
function setSocketIOInstance(socketInstance) {
    io = socketInstance;
}

// Function to schedule messages
function scheduleMessages() {
    // Check if file exists
    fs.access('messages.json', fs.constants.F_OK, (err) => {
        if (err) {
            console.error('File does not exist or is not accessible:', err);
            return;
        }

        // Read file content
        fs.readFile('messages.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }

            // Check if data is empty or not valid JSON
            if (!data.trim()) {
                console.log('No messages found.');
                return;
            }

            try {
                const messages = JSON.parse(data);

                // Check if messages is an array
                if (!Array.isArray(messages)) {
                    console.error('Invalid data format: messages is not an array');
                    return;
                }

                // Get current time
                const currentTime = new Date();

                // Loop through each message
                messages.forEach(async (message) => {
                    const { chatId, scheduleMessage, scheduleDate, scheduleTime, members, sender } = message;

                    // Parse scheduleDate and scheduleTime into Date object
                    const scheduledDate = new Date(scheduleDate + 'T' + scheduleTime);

                    // Compare hours and minutes of scheduled and current time
                    if (scheduledDate.getHours() === currentTime.getHours() &&
                        scheduledDate.getMinutes() === currentTime.getMinutes()) {
                        console.log('Message:', scheduleMessage);

                        // Emit the scheduled message as a new message using Socket.IO
                        emitScheduledMessage(chatId, scheduleMessage, members, sender);
                    }
                });
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        });
    });
}

// Function to emit the scheduled message as a new message using Socket.IO
async function emitScheduledMessage(chatId, message, members, sender) {
    if (!io) {
        console.error('Socket.IO instance is not set');
        return;
    }

    const messageForRealTime = {
        messageContent: message,
        _id: uuidv4(),
        sender: {
            _id: sender._id,
            name: sender.name,
            photo: sender.photo,
        },
        createdAt: new Date().toISOString(),
        chat: chatId
    };

    const memberSocket = getSockets(members);
    io.to(memberSocket).emit('NEW_MESSAGE', {
        chatId,
        message: messageForRealTime,
    });
    const messageForDB = {
        messageContent: message,
        sender: sender._id,
        chat: chatId,
    }
    try {
        const resp = await Message.create(messageForDB);
        const re = await Chat.findByIdAndUpdate({ _id: resp.chat }, { lastMessage: resp._id }, { new: true }).populate('lastMessage', "messageContent createdAt");
        // Remove the message from messages.json after storing in DB
        removeMessageFromFile(chatId);
    } catch (error) {
        console.log("message error", error.message)
    }
}

// Function to remove message from messages.json file
function removeMessageFromFile(chatId) {
    fs.readFile('messages.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        try {
            let messages = JSON.parse(data);

            // Filter out the message with the given chatId
            messages = messages.filter(message => message.chatId !== chatId);

            // Rewrite the file with the updated messages
            fs.writeFile('messages.json', JSON.stringify(messages), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    return;
                }
                console.log('Message removed from file.');
            });
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    })}

// Schedule task to check messages every minute
cron.schedule('* * * * *', () => {
    scheduleMessages();
});

module.exports = {
    setSocketIOInstance,
    scheduleMessages,
};
