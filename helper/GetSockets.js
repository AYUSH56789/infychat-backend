const userSocketUserIds=new Map()

const getSockets=(users)=>{
    const sockets=users.map((user)=>userSocketUserIds.get(user.toString()));
    return sockets;
}

module.exports={
    userSocketUserIds, getSockets
}