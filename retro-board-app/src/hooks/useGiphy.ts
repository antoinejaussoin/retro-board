import { useState, useEffect, useCallback } from 'react';
import { getGiphyUrl } from '../api';
import useOriginal from './useOriginal';
import { trackEvent } from '../track';

/**
 * Implements logic to show or hide the Gipy Image.
 * Returns an array of:
 *  - Giphy image URL
 *  - Whether to show the Giphy image or not
 *  - A toggle to force showing the image (or force hidding it)
 * @param giphyId Giphy ID
 */
export default function useGiphy(
  giphyId: string | null
): [string | null, boolean, () => void] {
  const [url, setUrl] = useState<string | null>(null);
  const original = useOriginal(giphyId);
  const [showImage, setShowImage] = useState(false);

  const toggleShowImage = useCallback(() => {
    setShowImage((prev) => !prev);
    trackEvent('game/post/giphy/toggle');
  }, []);

  useEffect(() => {
    if (giphyId !== original) {
      setShowImage(true);
    }
  }, [giphyId, original]);

  useEffect(() => {
    async function load() {
      if (!!giphyId) {
        const result = await getGiphyUrl(giphyId);
        setUrl(result);
      }
    }
    load();
  }, [giphyId]);

  return [url, showImage, toggleShowImage];
}
