require('dotenv').config();
const cors = require('cors')
const { v4: uuidv4 } = require('uuid');
const express=require('express');
const {dbConnect}=require('./connection.js');
const {authRouter}=require('./routes/AuthRouter.js');
const cookieParser = require('cookie-parser');
const {scheduleToDeleteUser}=require('./schedular/SchedularIndex.js');
const { feedbackRouter } = require('./routes/FeedbackRouter.js');
const { chatRouter } = require('./routes/ChatRouter.js');
const { createServer } = require('http');
const { Server } = require("socket.io");
const { CheckAuthentication, socketAuthentication } = require('./middlewares/CheckAuth.js');
const { scheduleMessages, setSocketIOInstance } = require('./schedular/messageSchedular.js');
const {  handleNewMessage } = require('./socket/handleNewMessage.js');

// schedular
scheduleToDeleteUser(); //this schedular delete inactive user from user collection in after 5 minutes...

const app=express();
const server=createServer(app);
const io=new Server(server,{
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});
// Set Socket.IO instance
setSocketIOInstance(io);
// msg schedular
scheduleMessages(io);

// additional atttributes setup 
const url=process.env.MONGODB_URL;
const port=process.env.SERVER_PORT || 2000;


// database connection 
dbConnect(url);

// middlewares

// always remember: 
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from the frontend
    credentials: true // Allow sending cookies from the frontend
}));
// other middlewares
app.use(express.json());
app.use(cookieParser()); //it is used to parse thr cookie

// routes
app.use('/api/v1',authRouter);
app.use('/api/v1/feedback',feedbackRouter);
app.use('/api/v1/chat',CheckAuthentication,chatRouter);//this is authenticc websites

// authentication middleware for socket io
io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res, async () => {
        await socketAuthentication(socket, next); // Pass the socket object
    });
});

// web sockets
io.on("connection", (socket) => {
    handleNewMessage(io, socket);
    // registerUserHandlers(io, socket);
  })

// server listen
server.listen(port,()=>{ console.log(`server listen at port ${port}`)})


















































































// const { getSockets, userSocketUserIds } =require('./helper/GetSockets.js');
// const { Message }= require('./models/MessageModel.js');

// require('dotenv').config();
// const cors = require('cors')
// const { v4: uuidv4 } = require('uuid');
// const express=require('express');
// const {dbConnect}=require('./connection.js');
// const {authRouter}=require('./routes/AuthRouter.js');
// const cookieParser = require('cookie-parser');
// const {scheduleToDeleteUser}=require('./schedular/SchedularIndex.js');
// const { feedbackRouter } = require('./routes/FeedbackRouter.js');
// const { chatRouter } = require('./routes/ChatRouter.js');
// const { createServer } = require('http');
// const { Server } = require("socket.io");

// const { CheckAuthentication, socketAuthentication } = require('./middlewares/CheckAuth.js');

// const { error } = require('console');
// const { Chat } = require('./models/ChatModel.js');
// const { Socket } = require('dgram');
// const { scheduleMessages } = require('./schedular/messageSchedular.js');


// const app=express();
// const server=createServer(app);
// const io=new Server(server,{
//     cors: {
//         origin: "http://localhost:5173",
//         credentials: true
//     }
// });

// // schedular
// scheduleToDeleteUser(io); //this schedular delete inactive user from user collection in after 5 minutes...
// console.log("io",io.to());
// // additional atttributes setup 
// const url="mongodb://127.0.0.1:27017/infychat?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.2";
// const port=process.env.SERVER_PORT || 2000;


// // database connection 
// dbConnect(url);

// // middlewares

// // always remember: 
// // =>>>> for single url
// app.use(cors({
//     origin: 'http://localhost:5173', // Allow requests from the frontend
//     credentials: true // Allow sending cookies from the frontend
// }));
// // other middlewares
// app.use(express.json());
// app.use(cookieParser()); //it is used to parse thr cookie

// scheduleMessages();
// // routes
// app.use('/api/v1',authRouter);
// app.use('/api/v1/feedback',feedbackRouter);
// app.use('/api/v1/chat',CheckAuthentication,chatRouter);//this is authenticc websites

// // authentication middleware for socket io
// io.use((socket, next) => {
//     cookieParser()(socket.request, socket.request.res, async () => {
//         await socketAuthentication(socket, next); // Pass the socket object
//     });
// });

// // web sockets
// io.on("connection", (socket) => {
//     // console.log("ios",io);
//     const user=socket.user
//     // set userId with socketId
//     userSocketUserIds.set(user._id.toString(),socket.id)
//     console.log(user.name+"--->>"+socket.id + " # online!");
    
//     socket.on('NEW_MESSAGE',async({chatId,members,message})=>{
//         const messageForRealTime={
//             messageContent:message,
//             _id:uuidv4(),
//             sender:{
//                 _id:user._id,
//                 name:user.name,
//                 photo:user.photo.url,
//             },
//             createdAt:new Date().toISOString(),
//             chat:chatId
//         }
//         console.log(messageForRealTime,);
//         const messageForDB={
//             messageContent:message,
//             sender:user._id,
//             chat:chatId,
//         }

//         const memberSocket=getSockets(members)
//         io.to(memberSocket).emit('NEW_MESSAGE',{
//             chatId,
//             message:messageForRealTime,
//         });
//         io.to(memberSocket).emit('NEW_MESSAGE_ALERT',{chatId})
//         try {
//             console.log("msgrealtime",messageForRealTime);
//             console.log("msgdb",messageForDB);
//             const resp=await Message.create(messageForDB);
//             console.log(resp);
//             const re=await Chat.findByIdAndUpdate({_id:resp.chat},{lastMessage:resp._id},{new:true}).populate('lastMessage',"messageContent createdAt");
//             console.log("msg data",re);
//         } catch (error) {
//             console.log("message error",error.message)
//         }
//         // console.log(data)
//         // socket.emit("reply",data)
//     })
//     socket.on('SCHEDULE_MESSAGE',async({chatId,members,messageData})=>{

// })
//     socket.on('START_TYPING',({chatId,members})=>{
//         console.log("typing",chatId)
//         const memberSocket=getSockets(members)
//         socket.to(memberSocket).emit('START_TYPING',{chatId});        
//     })
    
//     io.on("disconnect", () => {
//         console.log(socket.id + "-> offline!");
//         userSocketUserIds.delete(user._id.toString())
//     })
// })

// // server listen
// server.listen(port,()=>{ console.log(`server listen at port ${port}`)})

// // 
// module.exports={
//     io,
//     uuidv4
// }