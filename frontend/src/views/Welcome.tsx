import LoginContent from 'auth/modal/LoginContent';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';

export function Welcome() {
  const { t } = useTranslation();
  return (
    <div className="grid min-h-[calc(100dvh-3.5rem)] lg:grid-cols-[minmax(280px,0.9fr)_1.1fr]">
      <section className="flex flex-col bg-primary-800 px-8 py-10 text-white lg:px-12">
        <div className="flex flex-1 flex-col justify-center">
          <div className="max-w-md">
            <h1 className="text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
              {t('Welcome.title')}
            </h1>
          </div>
        </div>
        <p className="text-sm text-white/70">Real-time retrospectives</p>
      </section>
      <section className="flex items-center justify-center bg-paper px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-line bg-cream p-2 shadow-card">
          <LoginContent onClose={noop} anonymous />
        </div>
      </section>
    </div>
  );
}
