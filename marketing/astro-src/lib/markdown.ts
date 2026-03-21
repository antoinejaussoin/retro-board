import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import html from 'remark-html';

export async function renderMarketingMarkdown(markdown: string) {
  const result = await remark().use(remarkGfm).use(html).process(markdown);
  return normalizeLegacyImageDimensions(result.toString());
}

function normalizeLegacyImageDimensions(content: string) {
  return content.replace(
    /<img([^>]*?)src="([^",]+),(\d+)x(\d+)"([^>]*?)>/g,
    '<img$1src="$2" width="$3" height="$4"$5 loading="lazy" decoding="async">',
  );
}