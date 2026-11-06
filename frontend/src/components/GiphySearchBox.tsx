import { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

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
    <Wrapper>
      <Search
        value={query}
        placeholder="Search for GIFs"
        aria-label="Search for GIFs"
        onChange={(event) => setQuery(event.target.value)}
      />
      <Results>
        {error ? (
          <Message>Oops! Something went wrong. Please, try again.</Message>
        ) : null}
        {!error && !loading && gifs.length === 0 ? (
          <Message>No matches found.</Message>
        ) : null}
        {loading && gifs.length === 0 ? <Message>Loading...</Message> : null}
        <Grid>
          {gifs.map((gif) => {
            const src = gifPreviewUrl(gif);
            if (!src) return null;
            return (
              <GifButton
                key={gif.id}
                type="button"
                onClick={() => onSelect({ id: gif.id })}
              >
                <img src={src} alt={gif.title || 'GIF'} />
              </GifButton>
            );
          })}
        </Grid>
        {hasMore ? (
          <More
            type="button"
            onClick={() => void fetchPage(gifs.length, true, debouncedQuery)}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load more'}
          </More>
        ) : null}
      </Results>
      <Attribution href="https://giphy.com/" target="_blank" rel="noreferrer">
        Powered by GIPHY
      </Attribution>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 280px;
`;

const Search = styled.input`
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 8px;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font: inherit;
`;

const Results = styled.div`
  height: 300px;
  overflow: auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
`;

const GifButton = styled.button`
  padding: 0;
  border: 0;
  background: #eee;
  cursor: pointer;

  img {
    display: block;
    width: 100%;
  }
`;

const Message = styled.p`
  margin: 12px 0;
  color: #666;
  text-align: center;
`;

const More = styled.button`
  display: block;
  width: 100%;
  margin-top: 8px;
  padding: 8px;
  border: 0;
  background: transparent;
  cursor: pointer;
  font: inherit;
`;

const Attribution = styled.a`
  display: block;
  margin-top: 8px;
  color: #666;
  font-size: 12px;
  text-align: right;
`;
