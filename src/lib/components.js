import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Directory where your MDX component files live
const componentsDirectory = path.join(process.cwd(), 'src', 'components');

/**
 * Reads all MDX files and returns an array of metadata objects
 * Each object contains: { slug, title, description, status, version, ... }
 */
export function getAllComponentsMetadata() {
  const filenames = fs
    .readdirSync(componentsDirectory)
    .filter((name) => name.endsWith('.mdx') || name.endsWith('.md'));

  const allComponents = filenames.map((filename) => {
    const slug = filename.replace(/\.(mdx|md)$/, '');
    const fullPath = path.join(componentsDirectory, filename);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);

    return {
      slug,
      ...data // front-matter: title, description, status, version, etc.
    };
  });

  // Optionally sort by title or version
  return allComponents.sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Reads a single MDX file by slug and returns its metadata and content
 * @param {string} slug - filename without extension
 */
export function getComponentBySlug(slug) {
  const fullPath = path.join(componentsDirectory, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Component MDX not found for slug: ${slug}`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    frontMatter: data,
    content
  };
}