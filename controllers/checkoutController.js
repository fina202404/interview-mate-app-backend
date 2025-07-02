const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const planToPriceId = {
    'pro': 'price_1RYNwzPsl8BTiwySSd60uNzm',
    'enterprise': 'price_1RYNy8Psl8BTiwySG0etOq4O'
};

exports.createCheckoutSession = async (req, res) => {
    const { plan } = req.body;
    const priceId = planToPriceId[plan];

    if (!priceId) {
        return res.status(400).json({ message: 'Invalid plan selected.' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: req.user.email,
            client_reference_id: req.user._id.toString(),
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            
            success_url: ${process.env.FRONTEND_URL}/subscription-success?payment_status=success,
            cancel_url: ${process.env.FRONTEND_URL}/packages, // Changed to /packages as it's a more logical cancel URL
        });

        res.status(200).json({ url: session.url });

    } catch (error) {
        console.error('Stripe session error:', error);
        res.status(500).json({ message: 'Error creating Stripe checkout session.' });
    }


Message @Rajitha
