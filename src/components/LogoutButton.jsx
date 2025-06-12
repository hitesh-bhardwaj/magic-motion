'use client';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="px-4 py-2 bg-gray-300 rounded"
      onClick={async () => {
        await supabase.auth.signOut();
        router.push('/');
      }}
    >
      Logout
    </button>
  );
}
