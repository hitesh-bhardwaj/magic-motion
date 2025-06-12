/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function GalleryPage() {
  const supabase = createServerComponentClient({ cookies });

  // 1. Fetch all components metadata from Supabase
  const { data: components } = await supabase
    .from('components')
    .select('id, slug, title, description, status');
  const allComponents = Array.isArray(components) ? components : [];

  // 2. Get user session and their entitlements
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let userEntIds = []

  if (session) {
    const { data: entitlements } = await supabase
      .from('entitlements')
      .select('component_id')
      .eq('user_id', session.user.id);
    userEntIds = Array.isArray(entitlements)
      ? entitlements.map((e) => e.component_id)
      : [];
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Component Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allComponents.map((comp) => {
          const isFree = comp.status === 'free';
          const hasAccess = isFree || userEntIds.includes(comp.id);

          // Determine link based on access
          let href;
          if (hasAccess) {
            href = `/components/${comp.slug}`;
          } else if (!session) {
            href = `/login?redirect=/components/${comp.slug}`;
          } else {
            href = '/pricing';
          }

          return (
            <Link
              key={comp.id}
              href={href}
              className="block border rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={`/thumbnails/${comp.slug}.png`}
                alt={comp.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{comp.title}</h3>
                <span
                  className={
                    isFree
                      ? 'inline-block mt-2 px-2 py-1 text-sm bg-green-100 text-green-800 rounded'
                      : 'inline-block mt-2 px-2 py-1 text-sm bg-red-100 text-red-800 rounded'
                  }
                >
                  {isFree ? 'Free' : 'Paid'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}