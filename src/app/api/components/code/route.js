import { getComponentBySlug } from '@/lib/components';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  if (!slug) return Response.json({ error: 'No slug' }, { status: 400 });

  try {
    const cmp = getComponentBySlug(slug);
    return Response.json({ code: cmp.content });
  } catch {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
}
