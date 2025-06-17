const axios = require('axios');

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const Gemini = {
  generate: async (prompt) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Gemini Client Error:", error);
      throw new Error("Failed to generate content from AI.");
    }
  }
};

module.exports = { Gemini };

exports.Gemini = {
  generate: async (prompt) => {
    const res = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',

      
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY // ✅ correct header
        }
      }
    );
    return res.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I had trouble answering that.';
  }
};
