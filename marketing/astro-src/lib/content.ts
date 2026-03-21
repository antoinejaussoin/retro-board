import {
  getAllBlogsForLocale,
  getBlogBySlug,
  type BlogDocument,
  type BlogMetadata,
} from '../../src/lib/getBlog';
import {
  getAllLegalDocuments,
  getLegalByName,
  type LegalDocument,
  type LegalDocumentMetadata,
} from '../../src/lib/getLegal';
import { renderMarketingMarkdown } from './markdown';
import type { SupportedLocale } from './locales';

export type MarketingHomeData = {
  blogs: BlogMetadata[];
  legals: LegalDocumentMetadata[];
};

export async function getHomeData(
  locale: SupportedLocale,
): Promise<MarketingHomeData> {
  return {
    blogs: getAllBlogsForLocale(locale).slice(0, 3),
    legals: getAllLegalDocuments(),
  };
}

export function getBlogEntries(locale: SupportedLocale) {
  return getAllBlogsForLocale(locale);
}

export async function getBlogDocument(locale: SupportedLocale, slug: string) {
  const document = getBlogBySlug(slug, locale);
  return {
    ...document,
    contentHtml: await renderMarketingMarkdown(document.content),
  } satisfies BlogDocument & { contentHtml: string };
}

export function getLegalEntries() {
  return getAllLegalDocuments();
}

export async function getLegalDocument(slug: string) {
  const document = getLegalByName(slug);
  return {
    ...document,
    contentHtml: await renderMarketingMarkdown(document.content),
  } satisfies LegalDocument & { contentHtml: string };
}
