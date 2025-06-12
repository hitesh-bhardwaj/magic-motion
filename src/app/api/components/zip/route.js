import JSZip from 'jszip';
import { NextResponse } from 'next/server';
import { getComponentBySlug } from '../../../../lib/components';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'No slug' }, { status: 400 });

  try {
    const cmp = getComponentBySlug(slug);
    const zip = new JSZip();
    zip.file(`${slug}.mdx`, cmp.content);
    const content = await zip.generateAsync({ type: 'uint8array' });
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=${slug}.zip`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
