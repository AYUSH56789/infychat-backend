const { getSockets, userSocketUserIds } =require('../helper/GetSockets');
const { v4: uuidv4 } = require('uuid');
const { Message } = require('../models/MessageModel');
const { Chat } = require('../models/ChatModel');


function handleNewMessage(io,socket){;
    const user=socket.user

    // set userId with socketId
    userSocketUserIds.set(user._id.toString(),socket.id)

    // check
    console.log(user.name+"--->>"+socket.id + " # online!");

    // Emit online event
    io.emit('IS_ONLINE',  { userId: user._id });


    // listen new msg event
    socket.on('NEW_MESSAGE',async({chatId,members,message})=>{
        const messageForRealTime={
            messageContent:message,
            _id:uuidv4(),
            sender:{
                _id:user._id,
                name:user.name,
                photo:user.photo.url,
            },
            createdAt:new Date().toISOString(),
            chat:chatId
        }
        console.log(messageForRealTime,);
        const messageForDB={
            messageContent:message,
            sender:user._id,
            chat:chatId,
        }

        const memberSocket=getSockets(members)
        io.to(memberSocket).emit('NEW_MESSAGE',{
            chatId,
            message:messageForRealTime,
        });
        io.to(memberSocket).emit('NEW_MESSAGE_ALERT',{chatId})
        try {
            console.log("msgrealtime",messageForRealTime);
            console.log("msgdb",messageForDB);
            const resp=await Message.create(messageForDB);
            console.log(resp);
            const re=await Chat.findByIdAndUpdate({_id:resp.chat},{lastMessage:resp._id},{new:true}).populate('lastMessage',"messageContent createdAt");
            console.log("msg data",re);
        } catch (error) {
            console.log("message error",error.message)
        }
    })
    socket.on('START_TYPING',({chatId,members})=>{
        console.log("typing",chatId)
        const memberSocket=getSockets(members)
        socket.to(memberSocket).emit('START_TYPING',{chatId});        
    })
    
    // handle disconnect
    socket.on("disconnect", () => {
        console.log(socket.id + "-> offline!");
        userSocketUserIds.delete(user._id.toString())
        // Emit offline event
        io.emit('IS_ONLINE', { userId: user._id });
    })
}

module.exports={
    handleNewMessage
}



// pending work.
//1. alert.
//2. typing indicator.
//3. mode indicator[not working].
//4. bot assistance.
//5. voice call.
//6. video call.
//7. speech based navigation and messaging. 
//8. file sharing.
//9. location sharing.