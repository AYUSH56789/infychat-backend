const { User } = require("../models/UserModel")
const { verifyToken } = require("../services/AuthToken")

// PENDINFG TO VERIFY USER TO RESTRICT ONY LOGIN PERSON CAN USE IT
const CheckAuthentication = (req, res,next) => {
    try {
        // pending
        const token = req.cookies.authToken
        if (!token) {
            res.status(401).json({ Status: 500, success: false, message: "Access Denied" })
        }
        else {
            const userData = verifyToken(token, process.env.AUTH_SECRET_KEY)
            if (userData) {
                req.userId=userData._id;
                next()
            }
        }
    } catch (error) {
        res.status(401).json({ status: 401, success: false, message: "Access Denied"});
    }
}


const socketAuthentication = async (socket, next) => {
    try {
        // Access the authToken cookie directly
        const authToken = socket.request.cookies.authToken;
        if (!authToken) {
            console.log('Authentication token not provided');
            // You may want to throw an error here or handle the case appropriately
        }

        // Verify the authentication token
        const decoded = verifyToken(authToken, process.env.AUTH_SECRET_KEY);
    
        // Check if the user exists and is active
        const userExist = await User.findOne({ _id: decoded._id, status: "active" });

        if (!userExist) {
            console.log('Invalid user');
            // You may want to throw an error here or handle the case appropriately
        }

        // Attach user object to the socket for further use if needed
        socket.user = userExist;

        next(); // Authentication successful, move to next middleware or handler
    } catch (error) {
        console.log('Error in socket authentication:', error.message);
        // You may want to throw an error here or handle the case appropriately
    }
};


module.exports = {
    CheckAuthentication,
    socketAuthentication,
}