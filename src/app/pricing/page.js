'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseSession } from '@/lib/useSupabaseSession';
import { supabase } from '@/lib/supabase';

export default function PricingPage() {
  const { session, loading: sessionLoading } = useSupabaseSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Call your /api/checkout API
  const handleCheckout = async (mode) => {
    setLoading(true);

    // User must be logged in to purchase
    if (!session?.user?.email) {
      router.push('/login?redirect=/pricing');
      return;
    }

    // Fetch Stripe Checkout Session
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, email: session.user.email }),
    });
    const { sessionId } = await res.json();

    // Redirect to Stripe Checkout
    const stripe = await import('@stripe/stripe-js').then(m =>
      m.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    );
    await stripe.redirectToCheckout({ sessionId });
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-16 text-center">
      <h1 className="text-4xl font-bold mb-6">Pricing</h1>
      <div className="mb-6">
        <div className="p-6 border rounded-lg mb-4">
          <h2 className="text-2xl mb-2 font-semibold">One-Time Purchase</h2>
          <p>Lifetime access to all current components</p>
          <div className="text-3xl font-bold my-3">$100</div>
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded"
            onClick={() => handleCheckout('one_time')}
            disabled={loading || sessionLoading}
          >
            {loading ? 'Processing...' : 'Buy Now'}
          </button>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl mb-2 font-semibold">Subscription</h2>
          <p>Get new components every month</p>
          <div className="text-3xl font-bold my-3">$10/mo</div>
          <button
            className="bg-green-600 text-white px-6 py-2 rounded"
            onClick={() => handleCheckout('subscription')}
            disabled={loading || sessionLoading}
          >
            {loading ? 'Processing...' : 'Subscribe'}
          </button>
        </div>
      </div>
      {!session && (
        <div className="text-sm mt-4 text-gray-500">
          You need to <a className="text-blue-600 underline" href="/login?redirect=/pricing">log in</a> to purchase.
        </div>
      )}
    </div>
  );
}
