const { verifyToken } = require("../../services/AuthToken");

const handleLogout = (req, res) => {
    // retrieve token
    const token = req.cookies.authToken;
    // if no token in the cookies
    if (!token) {
        return res.status(401).json({ status: 401, success: true, message: "You are already logged out" });
    }
    // Verify the token
    else {
        const isTokenValid = verifyToken(token, process.env.AUTH_SECRET_KEY);
        if (!isTokenValid) {
            return res.status(401).json({ status: 401, success: false, message: "You are already logged out" });
        } else {
            res.clearCookie('authToken');
            return res.status(200).json({ status: 200, success: true, message: "Logout successful" });
        }
    }
}

module.exports = {
    handleLogout
}
