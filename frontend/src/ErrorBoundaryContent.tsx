import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'ui/button';

type ErrorBoundaryContentProps = {
  onHistoryChange: () => void;
};

export default function ErrorBoundaryContent({
  onHistoryChange,
}: ErrorBoundaryContentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialLocation] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== initialLocation) {
      onHistoryChange();
    }
  }, [location.pathname, initialLocation, onHistoryChange]);

  return (
    <div className="mx-auto max-w-xl px-6 pt-24 text-center">
      <h1 className="text-5xl font-medium tracking-tight">Ooopsie...</h1>
      <p className="mt-4 text-lg leading-8 text-muted">
        Something went badly wrong, we logged the error to try and fix it ASAP.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button onClick={() => navigate('/')}>Home Page</Button>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
