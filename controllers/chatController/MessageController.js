const { Chat } = require("../../models/ChatModel");
const { Message } = require("../../models/MessageModel");
const { User } = require("../../models/UserModel");


const handleGetMessages= async (req, res) => {
    try {
        // retreive chat_id from the request
        const { chatId ,page=1} = req.body
        // console.log(chatId);
        // check   whether it is valid or not
        if (!chatId) {
            res.status(400).json({ status: 400, success: false, message: "Bad Request" })
        }
        // check it is valid or not
        else {
            const isChatId = await Chat.findOne({ _id: chatId, chatParticipants: { $in: [req.userId] } })
            if (!isChatId) {
                return res.status(200).json({ status: 200, success: false, msg: 'Bad Request' });
            }
            // if valid
            else {
                // find all chat
                const resultPerPage=20;
                const skip=(page-1)*resultPerPage;
                const [chatMessages,totoalMessageCount] = await Promise.all([
                     Message.find({ chat: chatId })
                     .sort({ createdAt: -1 })
                     .skip(skip)
                     .limit(resultPerPage)
                     .populate("sender","name photo")
                     .lean(),
                     Message.countDocuments({chat:chatId})
                ]);
                  const totalPages=Math.ceil(totoalMessageCount/resultPerPage)
                  
                    res.status(200).json({ status: 200, success: true, message: "Chat Found", data:{chatMessages,totalPages,totoalMessageCount}  })
                }
            }
        }
    catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message })
    }
}


// const handleCreateMessages= async (req, res) => {
//     try {
//         // pending to check input data
//         // retreive message data from body-> receiver is optional for group chat
//         const { messageContent, messageType, chat, receiver, sentAt, seenBy } = req.body;
//         const sender = req.userId; // because sender is always logged user

//         //sender can'nt message  himself
//         if (receiver == sender) {
//             return res.status(403).json({ status: 403, success: false, message: "Forbidden" });
//         }
//         // check chatId is null or not -> if null that means  new chat so make a new one and save into database
//         if (chat === null) { // in case of group chat never null.

//             // check receiverId exists or not...

//             const isReceiverExist = await User.findOne({ _id: receiver });
//             if (!isReceiverExist) {
//                 res.status(404).json({ status: 404, success: false, message: "Invalid Receiver" })
//             }
//             else {
//                 // check sender and receiver is already chat participant or not
//                 const isParticipants = await Chat.findOne({ chatType: 'one-to-one', chatParticipants: { $all: [sender, receiver] } });
//                 // Handle the case where chat is null
//                 if (!isParticipants) {
//                     const data = {
//                         "chatType": "one-to-one",
//                         "chatParticipants": [sender, receiver],
//                         "lastMessage": null
//                     }
//                     // Create a new Chat participant with above data
//                     const newChat = await Chat.create(data);
//                     const newMessageData = await Message.create({ messageContent, messageType, chat: newChat._id, sender, receiver, sentAt, seenBy })

//                     // if not created
//                     if (!newMessageData) {
//                         res.status(400).json({ status: 400, success: false, message: "Message not created" });
//                     }
//                     else {
//                         // add last message reference to chat db
//                         const lastChat = await Chat.findByIdAndUpdate({ _id: newChat._id }, { lastMessage: newMessageData._id });
//                         res.status(200).json({ status: 200, success: true, message: "Message created successfully", data: newMessageData });
//                     }
//                 }
//                 else {
//                     // retreive chat chatId and add message into it
//                     res.status(400).json({ status: 400, success: false, message: "Bad Request ", data: isParticipants });
//                 }
//             }
//         }
//         else {

//             // check for wrong
//             const isChatExist = await Chat.findOne({ _id: chat, });
//             if (!isChatExist) {
//                 return res.status(400).json({ status: 400, success: false, msg: "Invalid chat " });
//             }
//             else {
//                 // if chat exist than divide logic on the basisc of chat.
//                 if (isChatExist.chatType === "one-to-one") { //for one-to-one chat
//                     // here i want to check that isChatExist.chatParticipant contain senderId and receiverId
//                     const senderExists = isChatExist.chatParticipants.includes(sender);
//                     const receiverExists = isChatExist.chatParticipants.includes(receiver);
//                     if (!senderExists || !receiverExists) {
//                         return res.status(400).json({ status: 400, success: false, msg: "Invalid sender or receiver" });
//                     }
//                     else {
//                         // store chat message in message db 
//                         const newMessageData = await Message.create({ messageContent, messageType, chat: isChatExist._id, sender, receiver, sentAt, seenBy })

//                         // if not created
//                         if (!newMessageData) {
//                             res.status(400).json({ status: 400, success: false, message: "Message not created" });
//                         }
//                         else {
//                             // add last message reference to chat db
//                             const lastChat = await Chat.findByIdAndUpdate({ _id: isChatExist._id }, { lastMessage: newMessageData._id });
//                             res.status(200).json({ status: 200, success: true, message: "Message created successfully", data: newMessageData });
//                         }
//                     }
//                 }
//                 else { //for group chat
//                     // here i want to check that isChatExist.chatParticipant contain senderId or not
//                     const senderExists = isChatExist.chatParticipants.includes(sender);
//                     if (!senderExists) {
//                         return res.status(400).json({ status: 400, success: false, msg: "Invalid sender" });
//                     }
//                     else {
//                         const newMessageData = await Message.create({ messageContent, messageType, chat: isChatExist._id, sender, receiver, sentAt, seenBy })

//                         // if not created
//                         if (!newMessageData) {
//                             res.status(400).json({ status: 400, success: false, message: "Message not created" });
//                         }
//                         else {
//                             // add last message reference to chat db
//                             const lastChat = await Chat.findByIdAndUpdate({ _id: isChatExist._id }, { lastMessage: newMessageData._id });
//                             res.status(200).json({ status: 200, success: true, message: "Message created successfully", data: newMessageData });
//                         }
//                     }
//                 }

//             }
//         }
//     } catch (error) {
//         res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
//     }
// }

module.exports={
    handleGetMessages,
    // handleCreateMessages,
}