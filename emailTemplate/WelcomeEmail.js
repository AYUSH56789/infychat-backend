const welcomeEmail = ({name,email}) => {
    return {
        from: {
            name: 'InfyChat Team',
            address: 'www.infychat01@gmail.com',
        },
        // to: 'ayushsingh46026@gmail.com', // Replace with actual user email
        to: `${email}`, // Replace with actual user email
      //   to: 'palansul11@gmail.com', // Replace with actual user email
        subject: `Welcome to infychat, ${name}!`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">              
                <p>Hi ${name.split(' ')[0]},</p>
                
                <p>We're thrilled to welcome you to the infychat community! infychat is a fast, secure, and reliable chat application designed to connect you with your loved ones and colleagues.</p>
                
                <p>Here are some resources to help you get started:</p>
                
                <ul>
                    <li><a href="[WEBSITE_LINK]" style="color: #007bff; text-decoration: none;">Learn more about infychat</a></li>
                    <li><a href="[FORUM_LINK]" style="color: #007bff; text-decoration: none;">Join our community forum</a></li>
                </ul>
                
                <p>If you have any questions, please don't hesitate to contact our support team at www.infychat01@gmail.com.</p>
                
                <p>We're excited to have you on board!</p>
                
                <p>Sincerely,</p>
                
                <p>The InfyChat Team</p>
            </div>
        `,
    };
  };
  
  module.exports = {
    welcomeEmail,
  };
  