const mongoose=require("mongoose");

const feedbackSchema=mongoose.Schema({
    feedbackUserName:{
        type:String,
        required:true,
    },
    feedbackUseremail:{
        type:String,
        required:true,
    },
    feedbackUserMobileNumber:{
        type:String,
        required:true,
    },
    feedbackMessage:{
        type:String,
        required:true,
    }
}, {timestamps: true});

const Feedback=mongoose.model('Feedback',feedbackSchema);

module.exports={
    Feedback,
}