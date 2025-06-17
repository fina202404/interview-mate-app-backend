// backend/controllers/interviewController.js

const { Gemini } = require('../services/geminiClient');


// @desc    Get interview questions
// @route   POST /api/get-questions
exports.getInterviewQuestions = async (req, res) => {
  const { jobTitle } = req.body;
  console.log(`Generating questions for: ${jobTitle}`);

  const questions = [
    `Tell me about your experience with ${jobTitle}.`,
    `What are your strengths relevant to a ${jobTitle} role?`,
    `Describe a challenging project you worked on as a ${jobTitle}.`,
    `Where do you see yourself in 5 years in the field of ${jobTitle}?`,
    `Why are you interested in this ${jobTitle} position?`
  ];

  if (!jobTitle) {
    return res.status(400).json({ success: false, message: "Job title is required." });
  }

  setTimeout(() => {
    res.json({ success: true, questions });
  }, 1000);
};

// @desc    Analyze interview answer
// @route   POST /api/analyze
exports.analyzeAnswer = async (req, res) => {
  const { question, answer } = req.body;
  console.log(`Analyzing answer for question: "${question}"`);
  console.log(`Answer: "${answer}"`);

  const feedback = {
    clarity: Math.floor(Math.random() * 3) + 7,
    relevance: Math.floor(Math.random() * 3) + 7,
    suggestions: [
      "Consider providing more specific examples.",
      "Your explanation of X was clear, try to elaborate on Y.",
      "Good use of technical terms relevant to the question."
    ]
  };

  if (!question || !answer) {
    return res.status(400).json({ success: false, message: "Question and answer are required." });
  }

  setTimeout(() => {
    res.json(feedback);
  }, 1500);
};

// ✅ NEW: Real-Time AI Interview Conversation
// @route   POST /api/interview/converse
exports.converse = async (req, res) => {
  try {
    let prompt;
    
    // This logic correctly handles both types of requests
    if (req.body.prompt) {
      prompt = req.body.prompt;
    } 
    else if (req.body.history && req.body.jobTitle) {
      const { history, jobTitle } = req.body;
      const formattedHistory = history.map(item => `${item.role === 'user' ? 'Candidate' : 'AI'}: ${item.text}`).join('\n');
      
      prompt = `
        You are an expert AI interviewer for the role of "${jobTitle}".
        Your persona is professional and encouraging. Ask one question at a time.
        Based on the conversation history below, ask the next logical follow-up question.
        IMPORTANT: If the candidate clarifies they are interviewing for a DIFFERENT role, adapt immediately.
        Conversation History:
        ---
        ${formattedHistory}
        ---
        AI:
      `;
    } 
    else {
      return res.status(400).json({ success: false, message: 'Request body must contain either "history" and "jobTitle", or a "prompt".' });
    }

    const aiResponse = await Gemini.generate(prompt);
    res.json({ success: true, reply: aiResponse });

  } catch (error) {
    console.error('AI conversation error in controller:', error);
    res.status(500).json({ success: false, message: 'AI interviewer failed to respond.' });
  }
};