import { useCallback, useEffect, useRef, useState } from 'react';

const PAGE_SIZE = 20;

type GiphyGif = {
  id: string;
  title?: string;
  images?: {
    fixed_width_downsampled?: { url?: string };
    fixed_width?: { url?: string };
  };
};

type GiphyResponse = {
  data?: GiphyGif[];
  pagination?: {
    total_count?: number;
  };
};

type GiphySearchBoxProps = {
  apiKey: string;
  onSelect: (gif: { id: string }) => void;
};

function gifPreviewUrl(gif: GiphyGif): string | undefined {
  return (
    gif.images?.fixed_width_downsampled?.url ?? gif.images?.fixed_width?.url
  );
}

export default function GiphySearchBox({
  apiKey,
  onSelect,
}: GiphySearchBoxProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 500);
    return () => window.clearTimeout(timer);
  }, [query]);

  const fetchPage = useCallback(
    async (offset: number, append: boolean, queryText: string) => {
      const id = ++requestId.current;
      const trimmed = queryText.trim();
      const endpoint = trimmed ? 'search' : 'trending';
      const url = new URL(`https://api.giphy.com/v1/gifs/${endpoint}`);
      url.searchParams.set('api_key', apiKey);
      url.searchParams.set('limit', String(PAGE_SIZE));
      url.searchParams.set('offset', String(offset));
      url.searchParams.set('rating', 'g');
      if (trimmed) url.searchParams.set('q', trimmed);

      setLoading(true);
      setError(false);
      try {
        const response = await fetch(url, { credentials: 'omit' });
        if (id !== requestId.current) return;
        if (!response.ok) {
          throw new Error(`Giphy search failed (${response.status})`);
        }
        const body = (await response.json()) as GiphyResponse;
        const next = body.data ?? [];
        const loaded = offset + next.length;
        const total = body.pagination?.total_count ?? loaded;
        setGifs((current) => (append ? [...current, ...next] : next));
        setHasMore(loaded < total);
      } catch {
        if (id !== requestId.current) return;
        setError(true);
        if (!append) setGifs([]);
        setHasMore(false);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [apiKey]
  );

  useEffect(() => {
    void fetchPage(0, false, debouncedQuery);
  }, [fetchPage, debouncedQuery]);

  return (
    <div className="w-[280px]">
      <input
        value={query}
        placeholder="Search for GIFs"
        aria-label="Search for GIFs"
        onChange={(event) => setQuery(event.target.value)}
        className="mb-2 box-border w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
      />
      <div className="h-[300px] overflow-auto">
        {error ? (
          <p className="my-3 text-center text-muted">
            Oops! Something went wrong. Please, try again.
          </p>
        ) : null}
        {!error && !loading && gifs.length === 0 ? (
          <p className="my-3 text-center text-muted">No matches found.</p>
        ) : null}
        {loading && gifs.length === 0 ? (
          <p className="my-3 text-center text-muted">Loading...</p>
        ) : null}
        <div className="grid grid-cols-2 gap-1">
          {gifs.map((gif) => {
            const src = gifPreviewUrl(gif);
            if (!src) return null;
            return (
              <button
                key={gif.id}
                type="button"
                onClick={() => onSelect({ id: gif.id })}
                className="bg-paper p-0"
              >
                <img src={src} alt={gif.title || 'GIF'} className="block w-full" />
              </button>
            );
          })}
        </div>
        {hasMore ? (
          <button
            type="button"
            onClick={() => void fetchPage(gifs.length, true, debouncedQuery)}
            disabled={loading}
            className="mt-2 w-full py-2 text-sm"
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        ) : null}
      </div>
      <a
        href="https://giphy.com/"
        target="_blank"
        rel="noreferrer"
        className="mt-2 block text-right text-xs text-muted"
      >
        Powered by GIPHY
      </a>
    </div>
  );
}
