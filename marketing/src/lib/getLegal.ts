import fs from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

export type LegalDocumentMetadata = {
  title: string;
  slug: string;
};

export type LegalDocument = LegalDocumentMetadata & {
  content: string;
};

const legalDirectory = join(process.cwd(), 'src/common/documents/legal');

export function getPostSlugs() {
  return fs.readdirSync(legalDirectory);
}

export function getLegalByName(slug: string): LegalDocument {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = join(legalDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const document = { ...data, slug: realSlug, content } as LegalDocument;

  return document;
}

export function getAllLegalDocuments(): LegalDocumentMetadata[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map(getLegalByName)
    .map(({ title, slug }) => ({ title, slug }));

  return posts;
}
