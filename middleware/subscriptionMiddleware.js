const User = require('../models/User');

// Middleware to check if user's plan is in the allowed list
// e.g., checkSubscription(['pro', 'enterprise'])
exports.checkSubscription = (allowedTiers) => {
  return (req, res, next) => {
    // We get req.user from our 'protect' middleware
    const userTier = req.user.subscriptionTier;

    if (!allowedTiers.includes(userTier)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden. Your current plan does not have access to this feature. Please upgrade.' 
      });
    }
    // If their plan is in the list, they can proceed
    next();
  };
};

// Middleware to check and increment usage limits
// e.g., checkUsageLimit('realInterview')
exports.checkUsageLimit = (featureType) => {
    return async (req, res, next) => {
        console.log(`--- STEP A: Middleware started for [${featureType}] ---`);
        try {
            const user = await User.findById(req.user.id);
            console.log(`--- STEP B: User found: ${user.email} ---`);

            let countField, maxField;
            switch (featureType) {
                case 'voiceInterview':
                    countField = 'voiceInterviewCount'; maxField = 'maxVoiceInterviews'; break;
                case 'realInterview':
                    countField = 'realInterviewCount'; maxField = 'maxRealInterviews'; break;
                case 'resumeAnalysis':
                    countField = 'resumeAnalysisCount'; maxField = 'maxResumeAnalyses'; break;
                default:
                    return res.status(400).json({ success: false, message: 'Invalid feature type.' });
            }
            console.log(`--- STEP C: Fields set. countField: ${countField} ---`);

            console.log(`--- STEP D: About to check if ${user[countField]} >= ${user[maxField]} ---`);
            if (user[countField] >= user[maxField]) {
                console.log(`--- STEP E: Usage limit reached. EXITING. ---`);
                return res.status(403).json({ message: 'Usage limit reached.' });
            }

            console.log(`--- STEP F: Check passed. Proceeding to increment. ---`);
            user[countField] += 1;
            console.log(`--- STEP G: Count incremented in memory to ${user[countField]}. About to save. ---`);
            await user.save();
            console.log(`--- STEP H: User saved to database. ---`);
            
            next();
            console.log(`--- STEP I: next() called. Middleware finished. ---`);

        } catch (error) {
            console.error('--- CATCH BLOCK ERROR ---', error);
            res.status(500).json({ message: 'Server error while checking usage.' });
        }
    };
};