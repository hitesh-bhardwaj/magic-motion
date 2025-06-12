'use client';
import Link from 'next/link';
import { useSupabaseSession } from '../lib/useSupabaseSession';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Header() {
    const { session, loading } = useSupabaseSession();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <header className="bg-white shadow">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo / Home Link */}
                <div className="flex items-center space-x-6">
                    <Link href="/" className="text-xl font-bold text-gray-800">
                        GSAP Components
                    </Link>
                    <Link href="/gallery" className="text-gray-600 hover:text-gray-900">
                        Gallery
                    </Link>
                    <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                        Pricing
                    </Link>
                </div>

                {/* Auth Links */}
                <div className="flex items-center space-x-4">
                    {!loading && !session && (
                        <>
                            <Link href="/login" className="text-gray-600 hover:text-gray-900">
                                Login
                            </Link>
                            <Link href="/signup" className="text-gray-600 hover:text-gray-900">
                                Sign Up
                            </Link>
                        </>
                    )}

                    {!loading && session && (
                        <>
                            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                                Dashboard
                            </Link>
                            <Link href="/account" className="text-gray-600 hover:text-gray-900">
                                Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
