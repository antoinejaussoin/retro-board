import { useEffect, useState } from 'react';

export default function useMd(url: string) {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    async function loadMd() {
      const response = await fetch(url);
      if (response.ok) {
        const mdContent = await response.text();
        setContent(mdContent);
      }
    }
    loadMd();
  }, [url]);

  return content;
}
