const { default: mongoose } = require("mongoose");
const { Chat } = require("../../models/ChatModel");
const { User } = require("../../models/UserModel");
const { Message } = require("../../models/MessageModel");
const { uploadOnCloudinary, deleteFromCloudinary } = require("../../services/Cloudinary");

// done
const handleCreateGroup = async (req, res) => {
    try {
        // add groupChatCreator {new} ,remove chatType
        // default user that request to create group is admin and creator
        const { groupChatName, chatParticipants } = req.body;

        // Remove duplicates from groupChatAdmins and chatParticipants
        // const uniqueAdmins = [...new Set(groupChatAdmins)];
        const uniqueParticipants = [...new Set(chatParticipants)];

        // check groupChatName is already exist or not:
        const isGroupExist = await Chat.findOne({ groupChatName: groupChatName })
        if (isGroupExist) {
            return res.status(400).json({ status: false, success: false, message: "Group Name is already exist" });
        }
        else {

            // // Check if admins are valid users
            // for (const userId of uniqueAdmins) {
            //     const isUserExist = await User.findOne({ _id: userId });
            //     if (!isUserExist) {
            //         return res.status(404).json({ status: false, success: false, message: "User does not exist" });
            //     }
            // }

            // Check if participants are valid users
            for (const userId of uniqueParticipants) {
                const isUserExist = await User.findOne({ _id: userId });
                if (!isUserExist) {
                    return res.status(404).json({ status: false, success: false, message: "User does not exist" });
                }
            }

            // set admin and creator
            const admin = [req.userId];
            const creator = req.userId;


            // If all checks pass, send success response
            const data = {
                chatType: "group",
                groupChatName,
                groupChatCreator: creator,
                groupChatAdmins: admin,
                chatParticipants: [...uniqueParticipants, req.userId],
                lastMessage: null
            };
            let newGroupChat = await Chat.create(data);
            if (!newGroupChat) {
                res.status(400).json({ status: 400, success: false, message: "Group created unsuccessfully" });
            } else {
                // emit message to all participant for new group creation.
                // const room = `group_${newGroupChat._id}`;
                // io.to(room).emit('new-group', { msg: 'New Group Created' });
                // res.status(200).json({ status: 200, success: true, message: "Group created successfully", newGroupChat });
                res.status(200).json({ status: 200, success: true, message: "Group created successfully", data: { _id: newGroupChat._id, groupChatName: newGroupChat.groupChatName } });
            }
        }
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
}

// done
const handleAddGroupMember = async (req, res) => {
    try {
        const { chatId, participants } = req.body;
        const userId = req.userId;
        // check is participants is given or not
        if (!participants) {
            res.status(400).json({ status: 400, success: false, message: "please provide participant" });
        }
        // check chat id is valid or not.
        const isValidChat = await Chat.findOne({ _id: chatId });
        if (!isValidChat) {
            res.status(400).json({ status: 400, success: false, message: "Invalid Chat Id" });
        }
        else {
            // check members are valid or not
            for (const userId of participants) {
                const isUserExist = await User.findOne({ _id: userId });
                if (!isUserExist) {
                    return res.status(404).json({ status: 404, success: false, message: "User does not exist" });
                }
                else {
                    // check it is already participant or not
                    const isParticipant = await Chat.findOne({ _id: chatId, chatParticipants: { $in: [userId] } });
                    if (isParticipant) {
                        return res.status(400).json({ status: 400, success: false, message: "User is already added" });
                    }
                }
            }
            // is user try to add is admin or not
            const isAdmin = await Chat.findOne({ _id: chatId, groupChatAdmins: { $in: [userId] } });
            if (!isAdmin) {
                return res.status(400).json({ status: 400, success: false, message: "only admin can add participant" });
            }
            else {
                // all member
                const allMember = isValidChat.chatParticipants.concat(participants.map(item => (new mongoose.Types.ObjectId(item))));

                if (allMember.length > 100) {
                    return res.status(400).json({ status: 400, success: false, message: "Maximum limit reach to add participants." });
                }
                else {

                    // add member in the existing chat and return updated chat details.
                    const updateChatData = await Chat.findByIdAndUpdate({ _id: chatId }, { chatParticipants: allMember })
                    console.log(updateChatData)
                    if (!updateChatData) {
                        return res.status(400).json({ status: 400, success: false, message: "Participant is not add." });
                    } else {
                        // emit message to all participant
                        // io.to(chatId).emit('remove-member',{message:" Member remove added"})
                        return res.status(200).json({ status: 200, success: true, message: "Participant Add Successfully." });
                    }
                }
            }
        }

    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
}

// done
const handleRemoveGroupMember = async (req, res) => {
    try {
        // extract data from request body
        const { chatId, rmUser } = req.body;
        const userId = req.userId;

        // check is participants is given or not
        if (!rmUser) {
            res.status(400).json({ status: 400, success: false, message: "please provide userId" });
        }
        // check chat id is valid or not.
        const isValidChat = await Chat.findOne({ _id: chatId });
        if (!isValidChat) {
            res.status(400).json({ status: 400, success: false, message: "Invalid Chat Id" });
        }
        else {
            // check rmUser are valid or not
            const isUserExist = await User.findOne({ _id: rmUser });
            if (!isUserExist) {
                return res.status(404).json({ status: 404, success: false, message: "User does not exist" });
            }
            else {
                // check it is participant or not
                const isParticipant = await Chat.findOne({ _id: chatId, chatParticipants: { $in: [rmUser] } });
                if (!isParticipant) {
                    return res.status(400).json({ status: 400, success: false, message: "User is not participant in this group" });
                }
                else {
                    // is user try to remove is admin or not
                    const isAdmin = await Chat.findOne({ _id: chatId, groupChatAdmins: { $in: [userId] } });
                    if (!isAdmin) {
                        return res.status(400).json({ status: 400, success: false, message: "only admin can add participant" });
                    }
                    else {
                        // all member 
                        const allMember = isValidChat.chatParticipants.filter((item) => item != rmUser);
                        if (allMember.length < 2) {
                            return res.status(400).json({ status: 400, success: false, message: "Atleast two participant is require." });
                        }
                        else {
                            // add new member in the existing chat and return updated chat details.
                            const updateChatData = await Chat.findByIdAndUpdate({ _id: chatId }, { chatParticipants: allMember })
                            console.log(updateChatData)
                            if (!updateChatData) {
                                return res.status(400).json({ status: 400, success: false, message: "Participant is not remove." });
                            } else {
                                // emit message to all participant
                                // io.to(chatId).emit('add-member',{message:"New Member added"})
                                return res.status(200).json({ status: 200, success: true, message: "Participant Remove Successfully." });
                            }
                        }

                    }
                }
            }
        }

    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
}

// done
const handleLeaveGroup = async (req, res) => {
    try {
        // extract data from request body
        const { chatId } = req.body;
        const userId = req.userId;

        // check is participants is given or not
        if (!chatId) {
            res.status(400).json({ status: 400, success: false, message: "please provide chatId" });
        }
        // check chat id is valid or not.
        const isValidChat = await Chat.findOne({ _id: chatId });
        if (!isValidChat) {
            res.status(400).json({ status: 400, success: false, message: "Invalid Chat Id" });
        }
        else {

            // check it is participant or not
            const isParticipant = await Chat.findOne({ _id: chatId, chatParticipants: { $in: [userId] } });
            if (!isParticipant) {
                return res.status(400).json({ status: 400, success: false, message: "User is not participant in this group" });
            }
            else {
                // all member 
                const allMember = isValidChat.chatParticipants.filter((item) => item != userId);
                // user try to leave is an admin or not
                const isAdmin = await Chat.findOne({ _id: chatId, groupChatAdmins: { $in: [userId] } });
                if (isAdmin && isAdmin.groupChatAdmins.length == 1) {
                    if (allMember.length < 2) {
                        return res.status(400).json({ status: 400, success: false, message: "Atleast two participant is require." });
                    }
                    else {
                        // assign another admin before leave
                        const newAdmin = [...isAdmin.groupChatAdmins.filter((item) => item != userId), allMember[0]];
                        const updateAdmin = await Chat.findByIdAndUpdate({ _id: chatId }, { groupChatAdmins: newAdmin })
                        // leave user from the existing chat and return updated chat details.
                        const updateChatData = await Chat.findByIdAndUpdate({ _id: chatId }, { chatParticipants: allMember })
                        if (!updateChatData) {
                            return res.status(400).json({ status: 400, success: false, message: "Participant is not leave." });
                        } else {
                            // emit message to all participant
                            // io.to(chatId).emit('add-member',{message:"New Member added"})
                            return res.status(200).json({ status: 200, success: true, message: "Participant leave Successfully." });
                        }
                    }
                }
                else {
                    // leave user from group
                    if (allMember.length < 2) {
                        return res.status(400).json({ status: 400, success: false, message: "Atleast two participant is require." });
                    }
                    else {
                        // add new member in the existing chat and return updated chat details.
                        const updateChatData = await Chat.findByIdAndUpdate({ _id: chatId }, { chatParticipants: allMember })
                        console.log(updateChatData)
                        if (!updateChatData) {
                            return res.status(400).json({ status: 400, success: false, message: "Participant is not leave." });
                        } else {
                            // emit message to all participant
                            // io.to(chatId).emit('add-member',{message:"New Member added"})
                            return res.status(200).json({ status: 200, success: true, message: "Participant leave Successfully." });
                        }
                    }
                }
            }
        }
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
}

// done
const handleSendAttachments = async (req, res) => {
    try {
        console.log("we reach");
        console.log("body",req.body);

        const { chatId } = req.body;
        if (!chatId) {
            res.status(400).json({ status: 400, success: false, message: "please provide chatId" });
        }
        // check chatId is valid or not.
        const [chat, user] = await Promise.all([
            Chat.findOne({ _id: chatId, chatParticipants: { $in: [req.userId] } }),
            User.findById({ _id: req.userId }, "name"),
        ]);

        if (!chat) {
            res.status(400).json({ status: 400, success: false, message: "please provide correct chatId" });
        }
        else {
            const files = req.files || [];
            // console.log("file:", files,"---",req.files)
            if (files.length < 1) {
                res.status(400).json({ status: 400, success: false, message: "please provide attachments" });
            }
            else {
                // upload file 
                // const photoUrl=await uploadOnCloudinary(file.path,'profilePhoto',email);
                const attachment = [];
                for (const file of files) {
                    const photoData = await uploadOnCloudinary(file.path, "attachment", file.originalname);
                    attachment.push(photoData);
                }
                console.log("attachment:", attachment)

                // message for real time
                const messageForRealTime = {
                    coontent: "",
                    attachment,
                    sender: {
                        _id: user._id,
                        name: user._id,
                    },
                    chat: chatId
                }
                // message for DB
                const messageForDB = {
                    messageType: "file",
                    messageContent: "",
                    attachment,
                    chat: chat._id,
                    sender: user._id,
                };
                const message = await Message.create(messageForDB);
                return res.status(200).json({ status: 200, success: true, data:data, message: "attachment send successfull" });
                // Emit the message to all participants in the chat
                // chat.chatParticipants.forEach(participantId => {
                // io.to(participantId).emit('getMessage', messageForRealTimeWithCreatedAt);
                // });
                // also emit alrt msg for all.
            }
        }

    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
}

// done
const handleGroupRename = async (req, res) => {
    try {
        const { name, chatId } = req.body;
        if (!name || !chatId) {
            res.status(400).json({ status: 400, success: false, message: "please provide name and chat" });
        }
        else {
            // check chatId is valid or not
            const chat = await Chat.findByIdAndUpdate({ _id: chatId }, { groupChatName: name });
            if (!chat) {
                res.status(400).json({ status: 400, success: false, message: "please provide valid chatId" });
            }
            else {
                // emit message to all members that that group has been renamed.

                return res.status(200).json({ status: 200, success: true, message: "group name change successfull" });
            }
        }
    }
    catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
}

// pending
const handleDeleteMesage = (req, res) => {
    try {

        res.send("hlo ji, logic pending hai")
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
}


// testing pending for one-to-one chat
const handleDeleteChat = async (req, res) => {
    try {
        const { chatId } = req.body;

        if (!chatId) {
            return res.status(400).json({ status: 400, success: false, message: "Please provide the chat id." });
        } else {
            // Check if the chat ID is valid
            const chat = await Chat.findOne({ _id: chatId, chatParticipants: { $in: [req.userId] } });
            if (!chat) {
                return res.status(404).json({ status: 404, success: false, message: "Please provide a valid chat id." });
            } else {
                // check chat is one to one or group is 
                // Get all attachments public IDs from the messages
                if (chat.chatType == 'one-to-one') {
                    const messagesWithAttachments = await Message.find({
                        chat: chatId,
                        messageType: "file"
                    });
                    const publicIds = [];
                    messagesWithAttachments.forEach(({ attachment }) => {
                        attachment.forEach(({ publicId }) => {
                            publicIds.push(publicId);
                        });
                    });

                    // Delete all attachments from Cloudinary
                    for (const publicId of publicIds) {
                        await deleteFromCloudinary(publicId);
                    }

                    // Delete all messages from the database
                    await Message.deleteMany({ chat: chatId });

                    // Delete the chat
                    await Chat.findByIdAndDelete({ _id: chatId });

                    return res.status(200).json({success:true, message: 'Deleted successfully' });
                }
                // if not 'one-to-one'  then it should be a group chat
                else {
                    // req.userId is admin or not
                    if (chat.groupChatAdmins.includes(req.userId)) {
                        // delete full chat
                        const messagesWithAttachments = await Message.find({
                            chat: chatId,
                            messageType: "file"
                        });
                        const publicIds = [];
                        messagesWithAttachments.forEach(({ attachment }) => {
                            attachment.forEach(({ publicId }) => {
                                publicIds.push(publicId);
                            });
                        });

                        // Delete all attachments from Cloudinary
                        for (const publicId of publicIds) {
                            await deleteFromCloudinary(publicId);
                        }

                        // Delete all messages from the database
                        await Message.deleteMany({ chat: chatId });

                        // Delete the chat
                        await Chat.findByIdAndDelete({ _id: chatId });

                        return res.status(200).json({success:true, message: 'Deleted successfully' });
                    } else {
                        // that means userId is normal group user
                        const updatedParticipant = chat.chatParticipants.filter((participant) => participant != req.userId)
                        const removeParticipant = await Chat.findByIdAndUpdate({ _id: chatId }, { chatParticipants: updatedParticipant })
                        return res.status(200).json({ success:true,message: 'Deleted successfully' });
                    }
                }
            }
        }
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
};

// done user
const handleSearchUser = async (req, res) => {
    try {
        // const {name}=req.body;
        // if(!name){
        // 
        // }
        const mychat = await Chat.find({ chatType: "one-to-one", chatParticipants: { $in: [req.userId] } });
        const allUsersFromMyChats = mychat.length != 0 ? mychat.map((item) => item.chatParticipants).flat() : [req.userId]
        // all users from me and my one to one chat participant
        let allUsersExceptMyParticipant = await User.find({
            _id: { $nin: allUsersFromMyChats },
            // name:{$regex:name,$options:"i"},
        })
        const user = allUsersExceptMyParticipant.map(({ _id, name, photo }) => ({
            _id,
            name,
            photo: photo.url
        }))
        res.status(200).json({ status: 200, success: true, message: "data found successfully", data: user });

    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
}

// search friend
const handleSearchFriend = async (req, res) => {
    try {
        const mychat = await Chat.find({ chatType: "one-to-one", chatParticipants: { $in: [req.userId] } }).populate('chatParticipants', 'name photo');

        const allUsersFromMyChats = mychat.length != 0 ? mychat.map((item) => item.chatParticipants).flat() : []

        const extactFriendList = allUsersFromMyChats.filter((item) => item._id != req.userId)
        // all from me and my one to one chat participant
        const friendList = extactFriendList.map(({ _id, name, photo }) => ({
            _id,
            name,
            photo: photo.url
        }))
        res.status(200).json({ status: 200, success: true, message: "data found successfully", data: friendList });

    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
}

// search all
const handleSearchAllUser = async (req, res) => {
    try {
        const allUser = await User.find({}, 'name photo');
        const allUserExceptMe = allUser.filter((item) => item._id != req.userId)
        const formatedData = allUserExceptMe.map(({ _id, name, photo }) => ({
            _id,
            name,
            photo: photo.url
        }))
        res.status(200).json({ status: 200, success: true, message: "data found successfully", data: formatedData });
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
}

// user detail api [done ->need update hard code data]
const handleUserDetail = async (req, res) => {
    try {
        const userId = req.userId;
        // get user detail:
        const user = await User.findById(userId);
        if (!user) {
            res.status(400).json({ status: 400, success: false, message: "User Not found !" })
        } else {
            const userId = req.userId;
            const formatedData = {
                name: user.name,
                email: user.email,
                language: user.language,
                scheduledMesage: {
                    messageCount: 0, //demo
                    message: [],//demo
                },
                hideUser: {
                    hideUserCount: 0, //demo
                    HideUser: [], //demo
                },
                encryptionKey: "sdfghjkl",
                photo: user.photo.url
            }
            res.status(200).json({ status: 200, success: true, message: "data found successfully", data: formatedData });
        }
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
}

// group detail
const handleGroupDetail = async (req, res) => {
    try {
        const { chatId } = req.body;
        if (!chatId) {
            res.status(400).json({ status: 400, success: false, message: "Please Provide Chat !" })
        } else {
            const user = await Chat.findOne({ _id: chatId }).populate('chatParticipants groupChatAdmins groupChatCreator', 'name photo language');
            const admins=user.groupChatAdmins.map(admin=>{
                return {
                    _id:admin._id,
                    name:admin.name,
                    photo:admin.photo.url
                }
            })
            const member=user.chatParticipants.map(member=>{
                return {
                    _id:member._id,
                    name:member.name,
                    photo:member.photo.url
                }
            })
            const allMembers=member.map(({_id,name,photo})=>{
                return {
                    _id,
                    name,
                    photo,
                    isadmin:admins.find(_admin=>_admin._id.toString()===_id.toString())?true:false
                }
            })
            const formatedData = {
                groupChatName: user.groupChatName,
                groupChatImage: user.groupChatImage,
                groupChatCreator: {
                    creatorName: user.groupChatCreator.name,
                    creatorPhoto: user.groupChatCreator.photo.url,
                },
                groupMember:{
                    memberCount:allMembers.length,
                    members:allMembers
                }
            }

                res.status(200).json({ status: 200, success: true, message: "data found successfully", data: formatedData });
        }
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
}

// seach friend detail
const handleFriendDetail = async (req, res) => {
    try {
        const { chatId } = req.body;
        if (!chatId) {
            res.status(400).json({ status: 400, success: false, message: "Please Provide Chat !" })
        } else {
            const user = await Chat.findOne({ _id: chatId }).populate('chatParticipants', 'name email photo language');
            const friendData = user.chatParticipants.find(item => item._id != req.userId); // Using find instead of filter to get a single participant
            const formatedData = {
                name: friendData.name,
                email: friendData.email,
                language: friendData.language,
                photo: friendData.photo.url
            };
            res.status(200).json({ status: 200, success: true, message: "data found successfully", data: formatedData });
        }
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
}

// testing pending
const handleDeleteUser = async (req, res) => {
    try {
        const userId = req.userId;

        // Find all chats where the user is a participant
        let allChats = await Chat.find({ chatParticipants: { $in: [userId] } });

        // Update each chat to remove the user from chatParticipants array
        const updatePromises = allChats.map(async chat => {
            await Chat.updateOne({ _id: chat._id }, { $pull: { chatParticipants: userId } });
        });

        // Execute all update promises
        await Promise.all(updatePromises);

        // Delete the user from the User database
        await User.deleteOne({ _id: userId });

        // Send a success response
        res.status(200).json({ status: 200, success: true, message: "User deleted successfully from all chats and User database." });

    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
};

const handleGetChatDetail = async (req, res) => {
    try {
        const {chatId}=req.body;
        console.log(chatId,"chatId");
        // Find all chats where the user is a participant
        let chat = await Chat.findOne({_id:chatId});
        console.log(chat);
        // Update each chat to remove the user from chatParticipants array
        // const member = chat.chatParticipants.filter( (member) => member!=req.userId );
        const member = chat.chatParticipants;

        //
        const formatedData={
            _id:chatId,
            members:member,
        }
        // Send a success response
        res.status(200).json({ status: 200, success: true,data:formatedData, message: "chat found successfully." });

    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message });
    }
};


module.exports = {
    handleCreateGroup,
    handleAddGroupMember,
    handleRemoveGroupMember,
    handleLeaveGroup,
    handleSendAttachments,
    handleGroupRename,
    handleDeleteChat,
    handleSearchUser,
    handleDeleteMesage,//pending
    handleSearchFriend,
    handleSearchAllUser,
    handleUserDetail,
    handleGroupDetail,
    handleFriendDetail,
    handleDeleteUser,
    handleGetChatDetail,
}