// routes/voiceRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/speak', async (req, res) => {
  const { text } = req.body;

  try {
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', // Sample voice ID
      {
        text,
        voice_settings: { stability: 0.5, similarity_boost: 0.5 }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    res.set({ 'Content-Type': 'audio/mpeg' });
    res.send(response.data);
  } catch (error) {
    console.error("🔴 ElevenLabs error:", error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to generate voice' });
  }
});

module.exports = router;
