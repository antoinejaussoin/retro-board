import fs from 'fs';
import matter from 'gray-matter';
import { join, basename } from 'path';
import { groupBy, values, sortBy } from 'lodash-es';

export type BlogMetadataGroup = {
  slug: string;
  lang: {
    [locale: string]: BlogMetadata;
  };
};

export type BlogMetadata = {
  title: string;
  subtitle: string;
  cover: string;
  author: string;
  date: string;
  slug: string;
  file: string;
  lang: string;
};

export type BlogDocument = BlogMetadata & {
  content: string;
};

const blogDirectory = join(process.cwd(), 'src/common/documents/blog');

/**
 * Get all blog files (paths) from the blog directory
 * @returns Array of file paths
 */
function getBlogFiles() {
  const allFiles = fs
    .readdirSync(blogDirectory)
    .filter((file) => !basename(file).startsWith('_'))
    .map((file) => join(blogDirectory, file));

  return allFiles;
}

/**
 * Get language code (locale) from file name
 * @param fileName Blog file name (without path)
 * @returns Language code (e.g. 'en', 'de')
 */
function getLangFromFileName(fileName: string) {
  const langRegex = /.*?\.([a-z]{2})\.md/g;
  const regexResult = langRegex.exec(fileName);
  return regexResult ? regexResult[1] : 'en';
}

/**
 * Get blog metadata from file
 * @param filePath Path to blog file
 * @returns Blog metadata
 */
function getBlogMetadata(filePath: string): BlogMetadata {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const base = basename(filePath);
  const lang = getLangFromFileName(base);

  const { data } = matter(fileContents);
  const document: BlogMetadata = {
    ...data,
    file: basename(filePath),
    lang,
  } as BlogMetadata;
  return document;
}

/**
 * Get all blog metadata (across all languages) grouped by slug
 * @returns Array of blog metadata groups
 */
export function getAllBlogs(): BlogMetadataGroup[] {
  const metadata = getBlogFiles().map(getBlogMetadata);
  return values(groupBy(metadata, (m) => m.slug)).map((group) => {
    const initial: BlogMetadataGroup = {
      slug: group[0].slug,
      lang: {},
    };
    return group.reduce((prev, cur) => {
      prev.lang[cur.lang] = cur;
      return prev;
    }, initial);
  });
}

/**
 * Get blog document (metadata + content) for a given slug and language
 * @param slug
 * @param lang
 * @returns Blog document (metadata + content)
 */
export function getBlogBySlug(slug: string, lang: string): BlogDocument {
  const allBlogs = getAllBlogs();
  const group = allBlogs.find((blog) => blog.slug === slug);
  if (group) {
    const blog = findBlogForLocale(group, lang);
    if (blog) {
      const path = join(blogDirectory, blog.file);
      const fileContents = fs.readFileSync(path, 'utf8');
      const { content } = matter(fileContents);
      return {
        ...blog,
        content,
      };
    }
  }
  throw new Error(`Blog not found for slug ${slug} and lang ${lang}`);
}

/**
 * Get all blog metadata for a given language
 * @param locale Language code (e.g. 'en', 'de')
 * @returns Array of blog metadata for a given language
 */
export function getAllBlogsForLocale(locale: string): BlogMetadata[] {
  const groups = getAllBlogs();
  const blogsForLocale = sortBy(
    groups.map((group) => findBlogForLocale(group, locale)).filter(Boolean),
    (g) => g.date
  ).reverse();

  return blogsForLocale;
}

function findBlogForLocale(
  group: BlogMetadataGroup,
  locale: string
): BlogMetadata | undefined {
  return group.lang[locale] || group.lang['en'];
}
