const express = require('express');
const { Feedback } = require('../models/FeedbackModel');
const { FeedbackValidation } = require('../middlewares/CheckFeedbackData');
const { validationResult } = require('express-validator');
const feedbackRouter = express.Router();

feedbackRouter.post('/', FeedbackValidation, async (req, res) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(422).json({ status: 422, success: false, message: "Inavlid Input", errors: error.array() });
        }
        else {
            const { feedbackUserName, feedbackUseremail, feedbackUserMobileNumber, feedbackMessage } = req.body;
            const user = await Feedback.create({ feedbackUserName, feedbackUseremail, feedbackUserMobileNumber, feedbackMessage });
            if (!user) {
                res.status(400).json({ status: 400, success: false, message: "Somthing Went Wrong" });
            }
            else {
                res.status(200).json({ status: 200, success: true, message: "You Feedback Submit Successfull" });
            }
        }
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", error: error.message })
    }
})

module.exports = {
    feedbackRouter,
}