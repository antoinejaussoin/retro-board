import { getPortalUrl } from './api';
import { useEffect, useState } from 'react';
import useUser from '../../auth/useUser';

export default function usePortalUrl(): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const user = useUser();
  useEffect(() => {
    async function fetchUrl() {
      if (user && user.stripeId) {
        const url = await getPortalUrl();
        setUrl(url);
      }
    }
    fetchUrl();
  }, [user]);

  return url;
}
