import { notFound, redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getComponentBySlug } from '@/lib/components';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { MDXComponents } from '@/components/MDXComponents';

// Generate paths based on Supabase components table
export async function generateStaticParams() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase
    .from('components')
    .select('slug');
  if (!Array.isArray(data)) return [];
  return data.map((c) => ({ slug: c.slug }));
}


export default async function ComponentPage({ params }) {
  const { slug } = params;

  const supabase = createServerComponentClient({ cookies });

  // 1. Fetch component record from DB
  const { data: compRecord } = await supabase
    .from('components')
    .select('id, slug, title, description, status')
    .eq('slug', slug)
    .single();

  if (!compRecord) return notFound();

  // 2. Check user session & entitlements
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: entitlements = [] } = await supabase
    .from('entitlements')
    .select('component_id')
    .eq('user_id', session?.user?.id);
  const userEntIds = Array.isArray(entitlements)
    ? entitlements.map((e) => e.component_id)
    : [];

  const isFree = compRecord.status === 'free';
  const hasAccess = isFree || userEntIds.includes(compRecord.id);

  // 3. Redirect if no access
  if (!hasAccess) {
    if (!session) {
      redirect(`/login?redirect=/components/${slug}`);
    } else {
      redirect('/pricing');
    }
  }

  // 4. Load MDX content by slug
  let cmp;
  try {
    cmp = getComponentBySlug(slug);
  } catch {
    return notFound();
  }
  const mdxSource = await serialize(cmp.content);

  // 5. Render
  return (
    <div className="container mx-auto py-10 prose">
      <h1 className="mb-4">{compRecord.title}</h1>
      <p className="text-gray-600 mb-6">{compRecord.description}</p>
      <MDXRemote source={mdxSource} components={MDXComponents} />
    </div>
  );
}