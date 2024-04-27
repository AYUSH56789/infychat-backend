const { generateToken } = require('../../services/AuthToken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { User } = require('../../models/UserModel');

const handleLoginRoute = async (req, res) => {
    try {
        //check is any error in the data send from client side
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ status: 422, success: false, message: "Inavlid Input", errors: errors.array() });
        }
        else {
            // const { email, password, mobileNumber } = req.body;
            const { email, password } = req.body;

            // check user exist or not
            const userExist = await User.findOne({ email: email, status: "active" });
            if (userExist) {
                // password comparision
                const result = await bcrypt.compare(password, userExist.password); // return true  or false
                if (result === true) {
                    // generate Token
                    const authToken = generateToken(userExist, process.env.AUTH_SECRET_KEY);
                    // res.cookie("authToken", authToken); //-> comment to fix same site bug and write new code
                    res.cookie("authToken", authToken, { sameSite: "None"});
                    const data = {
                        "userId":userExist._id,
                        "name": userExist.name,
                        "email": userExist.email,
                        "mobileNumber": userExist.mobileNumber,
                        "photo": userExist.photo.url,
                        "language": userExist.language,
                    }
                    res.status(200).json({ status: "200", success: true, data: data, message: "login succcessfully", "authToken": authToken });
                }
                else {
                    return res.status(400).json({ status: 400, success: false, message: 'Invalid User.' });
                }
            }
            else {
                return res.status(400).json({ status: 400, success: false, message: 'Invalid User.' });
            }
        }
    }
    catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message })
    }
};





module.exports = {
    handleLoginRoute,
}