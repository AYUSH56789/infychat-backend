const emailOtp = (data) => {
    return {
      from: {
        name: 'InfyChat Team',
        address: 'support@infychat.com' // Use a dedicated support email address
      },
      to: data.email,
      subject: 'Your OTP for InfyChat',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
          <h1 style="color: #007bff; text-align: center;">InfyChat OTP</h1>
  
          <p style="text-align: center;">Dear ${data.name || '-----'},</p>
  
          <p>Your One-Time Password (OTP) for InfyChat is:</p>
  
          <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; text-align: center; font-size: 24px;">
            ${data.otpCode}
          </div>
  
          <p style="text-align: center;">This OTP is valid for a limited time and should not be shared with anyone.</p>
  
          <p>If you did not request this OTP, please ignore this email.</p>
  
          <p style="text-align: center;">If you have any questions or need assistance, please don't hesitate to contact our support team at <a href="mailto:support@infychat.com" style="color: #007bff; text-decoration: none;">support@infychat.com</a>.</p>
  
          <p style="text-align: center; font-size: 16px; margin-top: 20px;">Best Regards,</p>
  
          <p style="text-align: center; font-size: 16px;">The InfyChat Team</p>
        </div>
      `
    };
  };
  
  module.exports = {
    emailOtp
  };
  