const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Your Price IDs from the previous step
const PRO_PLAN_PRICE_ID = 'price_1RYNwzPsl8BTiwySSd60uNzm';
const ENTERPRISE_PLAN_PRICE_ID = 'price_1RYNy8Psl8BTiwySG0etOq4O';

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.log(`❌ Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.client_reference_id;

        try {
            // ✅ To get the price ID, we need to retrieve the session and expand the line items
            const retrievedSession = await stripe.checkout.sessions.retrieve(session.id, {
                expand: ['line_items'],
            });
            
            const lineItems = retrievedSession.line_items.data;
            // Get the Price ID from the first item in the order
            const priceId = lineItems[0]?.price?.id;

            const user = await User.findById(userId);
            if (!user) {
                console.error(`Webhook error: User not found with ID: ${userId}`);
                return res.status(404).json({ message: 'User not found' });
            }

            // ✅ This block now sets the correct limits based on your request
            switch (priceId) {
                case PRO_PLAN_PRICE_ID:
                    user.subscriptionTier = 'pro';
                    user.maxVoiceInterviews = 20;
                    user.maxAvatarInterviews = 20;
                    user.maxRealInterviews = 20;
                    user.maxResumeAnalyses = 20;
                    break;
                case ENTERPRISE_PLAN_PRICE_ID:
                    user.subscriptionTier = 'enterprise';
                    const unlimited = 999999; 
                    user.maxVoiceInterviews = unlimited;
                    user.maxAvatarInterviews = unlimited;
                    user.maxRealInterviews = unlimited;
                    user.maxResumeAnalyses = unlimited;
                    break;
                default:
                    console.log(`Webhook: Unhandled price ID ${priceId}.`);
                    // We can choose to not change the plan if the price ID is unknown
                    res.status(200).json({ received: true });
                    return; 
            }
            
            // Reset their current usage counts to 0 for the new billing cycle
            user.voiceInterviewCount = 0;
            user.avatarInterviewCount = 0;
            user.realInterviewCount = 0;
            user.resumeAnalysisCount = 0;

            await user.save();
            console.log(`✅ Webhook success: User ${userId} limits were updated successfully.`);
            
        } catch (dbError) {
             console.error(`Webhook database error for user ${userId}:`, dbError);
        }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
};