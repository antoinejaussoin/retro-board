import LoginContent from 'auth/modal/LoginContent';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';
import logoColor from './layout/logo-color.png';
import textColor from './layout/text-color.png';

export function Welcome() {
  const { t } = useTranslation();
  return (
    <div className="grid min-h-[calc(100dvh-3.5rem)] lg:grid-cols-[minmax(280px,0.9fr)_1.1fr]">
      <section className="flex flex-col justify-between bg-primary-800 px-8 py-10 text-white lg:px-12">
        <div className="flex items-center gap-3">
          <img src={logoColor} alt="" className="h-12 w-auto" />
          <img src={textColor} alt="Retrospected" className="h-7 w-auto" />
        </div>
        <div className="max-w-md py-10">
          <h1 className="text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
            {t('Welcome.title')}
          </h1>
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
