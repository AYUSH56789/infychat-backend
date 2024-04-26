const nodemailer = require("nodemailer");

// mail send function
async function sendMail(data, template) {
    // 1. create email transporter [smtp]
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.GMAIL_ADDRESS,
            pass: process.env.GMAIL_PASSWORD
        }
    })
    // 2. configure email content
    const mailOptions = template(data);
    // 3. send mail
    try {
        const result = await transporter.sendMail(mailOptions);
        if (result.rejected.length > 0) {
            return { success: false, message: "Email has not been Sent" }
        }
        else {
            return { success: true, message: "Email has been Sent" }
        }
    } catch (error) {
        return { success: false, message: "Email has not been Sent" }
    }
}
module.exports = {
    sendMail,
}