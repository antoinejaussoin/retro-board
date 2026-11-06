import LanguagePicker from '../components/LanguagePicker';
import { useLanguage } from '../translations';
import config from '../utils/getConfig';
import useSidePanel from './panel/useSidePanel';
import ParticipantsList from './panel/ParticipantsList';
import { useMatch } from 'react-router-dom';
import { Sheet } from 'ui/sheet';

interface Policy {
  name: string;
  url: string;
}

const policies: Policy[] = [
  { name: 'Privacy policy', url: '/legal/privacy' },
  { name: 'Terms & Conditions', url: '/legal/terms' },
  { name: 'Disclaimer', url: '/legal/disclaimer' },
  { name: 'Cookies Policy', url: '/legal/cookies' },
  { name: 'Acceptable Use Policy', url: '/legal/acceptable-use' },
];

function Panel() {
  const [language, setLanguage] = useLanguage();
  const { opened, toggle } = useSidePanel();
  const hasParticipants = useMatch('/game/:gameId/*');

  return (
    <Sheet open={opened} onClose={toggle}>
      <div className="flex h-full flex-col">
        <div className="border-b border-line p-4">
          <LanguagePicker value={language.locale} onChange={setLanguage} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {hasParticipants ? <ParticipantsList /> : null}
        </div>
        <div className="border-t border-line px-5 py-4 text-sm">
          <LinkGroup title="Website">
            <a href={config.MARKETING_ROOT} target="_blank" rel="noreferrer">
              Main Website
            </a>
          </LinkGroup>
          <LinkGroup title="Documentation">
            <a
              href="https://docs.retrospected.com/docs/self-hosting/quick-start"
              target="_blank"
              rel="noreferrer"
            >
              Self Hosting
            </a>
            <a
              href="https://docs.retrospected.com/docs/features/encryption"
              target="_blank"
              rel="noreferrer"
            >
              Encrypted Sessions
            </a>
            <a
              href="https://docs.retrospected.com/docs/features/private-sessions"
              target="_blank"
              rel="noreferrer"
            >
              Private Sessions
            </a>
          </LinkGroup>
          <LinkGroup title="Legal">
            {policies.map((policy) => (
              <a
                href={config.MARKETING_ROOT + policy.url}
                target="_blank"
                rel="noreferrer"
                key={policy.name}
              >
                {policy.name}
              </a>
            ))}
          </LinkGroup>
          <p className="pt-4 text-center text-xs text-muted">
            Version {config.VERSION}
          </p>
        </div>
      </div>
    </Sheet>
  );
}

function LinkGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 border-t border-line py-4 first:border-t-0 first:pt-0">
      <h2 className="text-xs font-semibold tracking-wide text-ink uppercase">
        {title}
      </h2>
      <div className="flex flex-col gap-1 text-muted [&_a]:no-underline [&_a:hover]:text-ink [&_a:hover]:underline">
        {children}
      </div>
    </div>
  );
}

export default Panel;
