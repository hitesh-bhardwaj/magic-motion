'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        router.replace(redirectTo);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace(redirectTo);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.replace(redirectTo);
  };

  if (session) return null; // Already logged in

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="w-full max-w-sm p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input type="email" placeholder="Email" required className="w-full mb-2 border p-2 rounded"
          value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required className="w-full mb-4 border p-2 rounded"
          value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white rounded py-2">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="mt-4 text-center">
          <a href="/signup" className="text-blue-600 underline text-sm">
            Need an account? Sign up
          </a>
        </div>
      </form>
    </div>
  );
}
