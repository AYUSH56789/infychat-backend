const mongoose=require('mongoose');

async function dbConnect(url){
    try {
        await mongoose.connect(url);
    } catch (error) {
        console.log('database connection error');
    }
}

module.exports={
dbConnect,
}