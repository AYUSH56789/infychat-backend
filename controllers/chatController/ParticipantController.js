const { Chat } = require("../../models/ChatModel");
const { Message } = require("../../models/MessageModel");
const { User } = require("../../models/UserModel");

const handleGetParticipants = async (req, res) => {
    try {
        const userId = req.userId;
        // if userId does not exist
        if (!userId) {
            return res.status(400).json({ status: 400, success: false, message: "Bad Request" });
        }

        const allParticipant = await Chat.find({ chatParticipants: userId })
            .sort({ updatedAt: -1 })
            .populate({
                path: 'chatParticipants',
                select: 'name photo'
            })
            .populate({
                path: 'lastMessage',
                select: 'messageContent createdAt',
                match: { $expr: { $ne: ["$lastMessage", null] } } // Conditionally populate only when lastMessage is not null
            });

        // if no participants
        if (allParticipant.length === 0) {
            return res.status(200).json({ status: 200, success: true, participantData: [] });
        }

        const groupChat = allParticipant.filter((participant) => participant.chatType === 'group')
        const group = groupChat.map(({ _id, chatType, groupChatImage, groupChatName, lastMessage, updatedAt }) => ({
            _id,
            chatType,
            name: groupChatName,
            // photo:groupChatImage.url||null,
            photo: groupChatImage,
            lastMessage: lastMessage ? lastMessage.messageContent : null,
            updatedAt
        }))
        const oneToOneChat = allParticipant.filter((participant) => participant.chatType === 'one-to-one')
        const oneToOne = oneToOneChat.map(({ _id, chatType, chatParticipants, lastMessage, updatedAt }) => {
            // Filter out the user with userId
            const otherParticipant = chatParticipants.find(participant => participant._id != userId);
            return {
                _id,
                chatType,
                name: otherParticipant.name,
                photo: otherParticipant.photo.url,
                lastMessage: lastMessage ? lastMessage.messageContent : null,
                updatedAt
            }
        })
        const formatedData = [...group, ...oneToOne];

        // Sort the formatedData array in descending order based on the updatedAt field
        formatedData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        // res.status(200).json({ status: 200, success: true, participantData: { group, oneToOne } });
        res.status(200).json({ status: 200, success: true, participantData: formatedData });
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal server error", error: error.message });
    }
}


const handleAddOneToOneChat = async (req, res) => {
    try {
        const { reqUserId } = req.body;
        // check reqUserId is valid or not
        const isReqUserIdValid = await User.findOne({ _id: reqUserId });
        if (!isReqUserIdValid) {
            res.status(400).json({ status: 400, success: false, message: "please provide valid id." });
        } else {
            // create one to one chat without checking chat beacuse inn search list only non friend user is show
            const newChatData = {
                chatType: 'one-to-one',
                chatParticipants: [req.userId, reqUserId]
            }
            const newChat = await Chat.create(newChatData);
            if (!newChat) {
                res.status(400).json({ status: 400, success: false, message: "chat is not create" });

            }
            else {
                res.status(200).json({ status: 200, success: true, message: "chat create successfull" });
            }
        }
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal server error", error: error.message });
    }

}
module.exports = {
    handleGetParticipants,
    handleAddOneToOneChat,
}
