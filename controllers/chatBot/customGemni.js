const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// helper function
function replaceWords(text) {
    // Replace "Google" or "google" with "infychat"
    text = text.replace(/Google/g, 'infychat').replace(/google/g, 'infychat');
    
    // Replace "Gemini" with "iBot"
    text = text.replace(/Gemini/g, 'iBot');
    
    return text;
}
// Your route handlers
 const handleCustomGemniChatBot=async (req, res) => {
  try {
    const promptText = req.body?.promptText; // Use optional chaining to avoid TypeError if req.body is undefined
    if (!promptText) {
      throw new Error('Prompt text is missing in the request body');
    }

    // Configuration
    const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const generationConfig = { temperature: 0.9, topP: 1, topK: 1, maxOutputTokens: 4096 };

    // Initialise model
    const model = genAi.getGenerativeModel({ model: "gemini-pro", generationConfig });

    // Generate content
    const result = await model.generateContent(promptText);
    const response = await result.response;
    console.log(response);
    res.status(200).json({ status: 200, success: true, message: "Successfully prompted", data: replaceWords(response.text()) });
  } catch (error) {
    console.error("Error in generating content", error);
    res.status(500).json({ status: 500, success: false, message: error.message });
  }
};

// app.post('/text-img', async (req, res) => {
//   try {
//     // Your implementation for /text-img route
//   } catch (error) {
//     console.error("Error in generating content", error);
//     res.status(500).json({ status: 500, success: false, message: error.message });
//   }
// });

// app.listen(3001, () => { console.log("Server is started at port 3001") });

module.exports={
    handleCustomGemniChatBot,
}
