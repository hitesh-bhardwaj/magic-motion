import nextMDX from '@next/mdx';

const withMDX = nextMDX({
  extension: /\.(md|mdx)$/,
  options: {
    // Optionally add remark or rehype plugins here
    // remarkPlugins: [],
    // rehypePlugins: []
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Register MDX pages alongside JS/TS
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  // Other Next.js config options here
};

export default withMDX(nextConfig);