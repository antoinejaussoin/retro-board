import { useEffect, useState } from 'react';

export default function useMd(url: string) {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    async function loadMd() {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const mdContent = await response.text();
          setContent(mdContent);
        }
      } catch (error) {
        console.error('Error while fetching a MD file', error);
      }
    }
    loadMd();
  }, [url]);

  return content;
}
