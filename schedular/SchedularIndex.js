const cron=require('node-cron')
const { User } = require('../models/UserModel')

// this schedular run in every five minutes to check user status in user db and if user status is inactive than delete that user 
function scheduleToDeleteUser(){
cron.schedule("*/5 * * * *",async()=>{
    const inactiveUser=await User.deleteMany({"status":"inactive"})
    if(inactiveUser.deletedCount>0){
    console.log(`${inactiveUser.deletedCount} Inactive user deleted` )
    }
})
}

module.exports={
    scheduleToDeleteUser
}