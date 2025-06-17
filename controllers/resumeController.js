const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const User = require('../models/User');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// This is the function we are updating
exports.analyzeResumeWithJob = async (req, res) => {
    try {
        const { jobTitle } = req.body;
        const pdfBuffer = req.file.buffer;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Not authorized, user ID not found." });
        }
        if (!jobTitle) {
            return res.status(400).json({ success: false, message: "Job title is required." });
        }

        const data = await pdfParse(pdfBuffer);
        const resumeText = data.text;

        // --- NEW, SMARTER PROMPT ---
        // We are now asking the AI to return a JSON object directly.
        const prompt = `
            You are an expert HR analyst and resume advisor. A candidate is applying for the role of "${jobTitle}".
            Based on the resume text provided below, return your analysis ONLY as a raw JSON object. Do not include markdown formatting like \`\`\`json.

            Your JSON object must have these exact keys: "matchScore", "overallSummary", "strengths", "areasForImprovement", "actionPlan".
            - "matchScore" must be a number between 0 and 100.
            - "overallSummary" must be a concise 1-2 sentence summary.
            - "strengths", "areasForImprovement", and "actionPlan" must be arrays of strings.

            Example JSON structure:
            {
              "matchScore": 75,
              "overallSummary": "The candidate has a strong educational background but lacks direct experience for this senior role.",
              "strengths": ["Relevant degree from a top university.", "Experience with Node.js is a plus."],
              "areasForImprovement": ["Lacks experience with key skills like Kubernetes.", "Project descriptions could be more results-oriented."],
              "actionPlan": ["Gain certification in Kubernetes.", "Rewrite project descriptions to include quantifiable achievements (e.g., 'increased performance by 20%')."]
            }

            Here is the resume text:
            ---
            ${resumeText}
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const feedbackText = result.response.text();
        
        // --- PARSE THE AI's JSON RESPONSE ---
        let feedbackJson;
        try {
            feedbackJson = JSON.parse(feedbackText);
        } catch (e) {
            console.error("❌ Failed to parse JSON from AI response:", feedbackText);
            return res.status(500).json({ success: false, message: "AI returned an invalid response. Please try again." });
        }

        // We will generate PDF reports on the frontend now, so backend generation can be removed if you wish.
        await ResumeAnalysis.create({
            userId: userId,
            jobTitle,
            feedback: JSON.stringify(feedbackJson), // Store the structured feedback
            score: feedbackJson.matchScore || 0
        });
        
        // --- SEND THE STRUCTURED JSON TO THE FRONTEND ---
        res.status(200).json({
            success: true,
            feedback: feedbackJson // Send the parsed JSON object
        });

    } catch (err) {
        console.error("❌ Error analyzing resume:", err);
        res.status(500).json({ success: false, message: "Resume analysis failed." });
    }
};


// You can keep your other functions if you still need them, for example:
exports.analyzeResumeContent = async (req, res) => {
    // ... your existing code ...
};
exports.generateResumeReport = async (req, res) => {
    // ... your existing code ...
};
