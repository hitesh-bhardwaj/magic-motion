import Stripe from 'stripe';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.email)
    return Response.json({ error: 'Not logged in' }, { status: 401 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

  // Find the user's Stripe customer ID (store this in your DB when user purchases)
  // Here, you'd look up the user and get their customerId, example:
  // const customerId = await getStripeCustomerId(session.user.id);

  // For demo purposes, hardcode or fetch by email:
  const customers = await stripe.customers.list({ email: session.user.email, limit: 1 });
  if (!customers.data.length)
    return Response.json({ error: 'No Stripe customer' }, { status: 404 });
  const customerId = customers.data[0].id;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
  });

  return Response.json({ url: portalSession.url });
}
