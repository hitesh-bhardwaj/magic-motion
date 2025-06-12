/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user & unlocked components
  useEffect(() => {
    const getUserAndLibrary = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login?redirect=/dashboard');
        return;
      }
      setUser(session.user);

      // Fetch unlocked components
      const { data: entitlements } = await supabase
        .from('entitlements')
        .select('component_id, components (slug, title, description)')
        .eq('user_id', session.user.id);
      // entitlements[].components = component details
      const unlocked = (entitlements || []).map(e => e.components);
      setComponents(unlocked);
      setLoading(false);
    };
    getUserAndLibrary();
  }, [router]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">My Library</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {components.length === 0 && (
          <div className="col-span-3 text-gray-500">No unlocked components yet.</div>
        )}
        {components.map(comp => (
          <div key={comp.slug} className="border rounded-lg p-4 flex flex-col">
            <img
              src={`/thumbnails/${comp.slug}.png`}
              alt={comp.title}
              className="w-full h-32 object-cover mb-2 rounded"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{comp.title}</h3>
              <p className="text-sm text-gray-500">{comp.description}</p>
            </div>
            <div className="mt-3 flex gap-2">
              <a
                href={`/components/${comp.slug}`}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                rel="noopener noreferrer"
              >
                View Demo
              </a>
              <CopyCodeButton slug={comp.slug} />
              <DownloadZipButton slug={comp.slug} />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div>
          <span className="font-medium">Email:</span> {user.email}
        </div>
        <div className="flex gap-3">
          <ManageSubscriptionButton />
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/');
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Helper Components ----------

// Copy code to clipboard from MDX (requires an API or SSR for code content)
function CopyCodeButton({ slug }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Call an API endpoint that returns the code (MDX content) by slug
    const res = await fetch(`/api/components/code?slug=${slug}`);
    const { code } = await res.json();
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      className="bg-gray-200 px-3 py-1 rounded text-sm"
      onClick={handleCopy}
    >
      {copied ? 'Copied!' : 'Copy Code'}
    </button>
  );
}

// Download ZIP with MDX code for component (calls API)
function DownloadZipButton({ slug }) {
  const handleDownload = async () => {
    const res = await fetch(`/api/components/zip?slug=${slug}`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.zip`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  return (
    <button
      className="bg-gray-200 px-3 py-1 rounded text-sm"
      onClick={handleDownload}
    >
      Download ZIP
    </button>
  );
}

// Manage Stripe subscription (redirects to Stripe customer portal)
function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handlePortal = async () => {
    setLoading(true);
    const res = await fetch('/api/stripe-portal', { method: 'POST' });
    const { url } = await res.json();
    window.location.href = url;
    setLoading(false);
  };

  return (
    <button
      className="bg-green-600 text-white px-4 py-2 rounded"
      onClick={handlePortal}
      disabled={loading}
    >
      {loading ? 'Redirecting...' : 'Manage Subscription'}
    </button>
  );
}
