import Stripe from 'stripe';

export async function POST(request) {
  const { mode, email } = await request.json();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
  const priceId =
    mode === 'subscription'
      ? process.env.STRIPE_PRICE_SUBS
      : process.env.STRIPE_PRICE_ONETIME;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: mode === 'subscription' ? 'subscription' : 'payment',
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
  });

  return Response.json({ sessionId: session.id });
}
