import { buffer } from 'micro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
  const sig = req.headers['stripe-signature'];
  const body = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Connect Supabase (with service key!)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Handle new successful purchase (one-time or subscription)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email;
    const mode = session.mode; // 'payment' or 'subscription'
    const stripe_sub_id = session.subscription || null; // Only present for subscriptions

    // 1. Lookup the user in public.users table (synced on signup!)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!user || userError) return res.status(200).end();

    // 2. Insert/Upsert subscription (always create, or update if exists)
    if (mode === 'subscription' && stripe_sub_id) {
      // The subscription object will have status like 'active', 'trialing', etc.
      // Fetch the Stripe subscription object for status
      const stripeSub = await stripe.subscriptions.retrieve(stripe_sub_id);
      await supabase
        .from('subscriptions')
        .upsert([
          {
            user_id: user.id,
            stripe_subscription_id: stripe_sub_id,
            status: stripeSub.status,
            updated_at: new Date().toISOString(),
          }
        ], { onConflict: 'user_id' });
    }

    // 3. Grant entitlements for ALL components (for one-time purchase OR subscription)
    const { data: components } = await supabase.from('components').select('id');
    if (Array.isArray(components) && components.length) {
      for (const comp of components) {
        // Upsert to prevent duplicate entitlements
        await supabase
          .from('entitlements')
          .upsert([
            {
              user_id: user.id,
              component_id: comp.id,
              granted_at: new Date().toISOString(),
            }
          ], { onConflict: 'user_id,component_id' });
      }
    }
  }

  // 4. Handle subscription updates (optional: revoke entitlements if needed)
  if (['customer.subscription.deleted', 'invoice.payment_failed'].includes(event.type)) {
    const sub = event.data.object;
    // Find the user by Stripe subscription id
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', sub.id)
      .single();
    if (subscription) {
      // Update subscription status
      await supabase
        .from('subscriptions')
        .update({ status: sub.status, updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', sub.id);

      // REVOKE all paid entitlements for this user
      // First, get IDs of all paid components
      const { data: paidComponents } = await supabase
        .from('components')
        .select('id')
        .eq('status', 'paid');
      const paidIds = Array.isArray(paidComponents) ? paidComponents.map(c => c.id) : [];

      if (paidIds.length > 0) {
        await supabase
          .from('entitlements')
          .delete()
          .eq('user_id', subscription.user_id)
          .in('component_id', paidIds);
      }
    }
  }

  res.status(200).end();
}
