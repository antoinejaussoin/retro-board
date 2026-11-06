import { Info } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

interface HowDoesItWorkButtonProps {
  children: ReactElement;
  url: string;
}

export default function HowDoesItWorkButton({
  children,
  url,
}: HowDoesItWorkButtonProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <span className="inline-flex flex-col items-end">
      {children}
      <button
        type="button"
        onClick={() => navigate(url)}
        className="mt-1 inline-flex items-center gap-1 text-[0.7rem] text-sky-100 hover:text-sky-300 hover:underline"
      >
        <Info className="size-3" />
        {t('Home.howDoesThatWork')}
      </button>
    </span>
  );
}
