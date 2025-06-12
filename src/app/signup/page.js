'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { error } = await supabase.auth.signUp({ email, password });
        setLoading(false);
        if (error) setError(error.message);
        else router.replace(redirectTo);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <form
                onSubmit={handleSignup}
                className="w-full max-w-sm p-6 bg-white rounded shadow"
            >
                <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
                <input
                    type="email"
                    placeholder="Email"
                    required
                    className="w-full mb-2 border p-2 rounded"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    required
                    className="w-full mb-4 border p-2 rounded"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                {error && <div className="text-red-500 mb-2">{error}</div>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white rounded py-2"
                >
                    {loading ? 'Signing up...' : 'Sign Up'}
                </button>
                <div className="mt-4 text-center">
                    <a href="/login" className="text-blue-600 underline text-sm">
                        Already have an account? Log in
                    </a>
                </div>
            </form>
        </div>
    );
}
