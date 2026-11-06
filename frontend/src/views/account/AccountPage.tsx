import { noop } from 'lodash';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LoginContent from 'auth/modal/LoginContent';
import useIsTrial from 'auth/useIsTrial';
import LanguagePicker from 'components/LanguagePicker';
import { Page } from 'components/Page';
import ProPill from 'components/ProPill';
import Tag from 'components/TagInput/Tag';
import useBackendCapabilities from 'global/useBackendCapabilities';
import useFormatDate from 'hooks/useFormatDate';
import useModal from 'hooks/useModal';
import { NameEditor } from 'molecules/NameEditor';
import useUser from 'state/user/useUser';
import { useLanguage } from 'translations';
import { Alert } from 'ui/alert';
import { Button } from 'ui/button';
import TrialPrompt from '../home/TrialPrompt';
import { updateAdmins } from './api';
import AdminsEditor from './AdminEditor';
import { DeleteModal } from './delete/DeleteModal';
import MembersEditor from './MembersEditor';
import Section from './Section';
import usePortalUrl from './usePortalUrl';

function Detail({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
      <div className="w-full shrink-0 text-sm font-semibold sm:w-52 sm:pt-0.5">
        {label}
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
        {children}
      </div>
    </div>
  );
}

function AccountPage() {
  const url = usePortalUrl();
  const user = useUser();
  const [admins, setAdmins] = useState<string[] | null>(null);
  const [language, setLanguage] = useLanguage();
  const isTrial = useIsTrial();
  const formatDistanceToNow = useFormatDate();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [deleteModalOpen, handleDeleteModalOpen, handleDeleteModalClose] =
    useModal();
  const capabilities = useBackendCapabilities();

  useEffect(() => {
    setAdmins(user?.planAdmins || null);
  }, [user]);

  const handleEditAdmins = useCallback((admins: string[]) => {
    setAdmins(admins);
    updateAdmins(admins);
  }, []);

  const ownsThePlan = user && !!user.ownSubscriptionsId;
  const onSomebodysPlan = user && !!user.plan && !user.ownSubscriptionsId;

  const isPlanAdmin =
    user &&
    user.email &&
    user.planAdmins &&
    user.planAdmins.includes(user.email);

  if (!user) {
    return null;
  }

  return (
    <>
      <TrialPrompt />
      <Page>
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 text-3xl font-medium tracking-tight">
            <ProPill />
            <NameEditor />
          </div>

          {user.accountType === 'anonymous' ? (
            <Section title={t('AccountPage.convertTitle')!}>
              <Alert severity="warning">{t('AccountPage.convertWarning')}</Alert>
              <LoginContent onClose={noop} anonymous={false} />
            </Section>
          ) : (
            <Section title={t('AccountPage.details.header')!}>
              <Detail label={t('AccountPage.details.username')}>
                {user.username}
              </Detail>
              <Detail label={t('AccountPage.details.email')}>
                {user.email}
              </Detail>
              <Detail label={t('AccountPage.details.accountType')}>
                {user.accountType}
              </Detail>
            </Section>
          )}

          <Section title={t('AccountPage.details.language')!}>
            <LanguagePicker
              value={language.locale}
              onChange={setLanguage}
              variant="standard"
            />
          </Section>

          {capabilities.slackClientId ? (
            <Section title={t('AccountPage.slack.header')!}>
              <Alert severity="info">{t('AccountPage.slack.help')}</Alert>
              <a
                href={`https://slack.com/oauth/v2/authorize?client_id=${capabilities.slackClientId}&scope=commands&user_scope=`}
              >
                <img
                  alt={t('AccountPage.slack.addToSlack')!}
                  height="40"
                  width="139"
                  src="https://platform.slack-edge.com/img/add_to_slack.png"
                  srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
                />
              </a>
            </Section>
          ) : null}

          {user.plan ? (
            <Section title={t('AccountPage.plan.header')!}>
              <Detail label={t('AccountPage.plan.plan')}>{user.plan}</Detail>

              {onSomebodysPlan ? (
                <Detail label={t('AccountPage.plan.members')}>
                  {[user.planOwnerEmail, ...(user.planMembers || [])]
                    .filter(Boolean)
                    .map((email, i) => (
                      <Tag key={i} value={email} />
                    ))}
                </Detail>
              ) : null}

              <Detail label={t('AccountPage.plan.admins')}>
                {[user.planOwnerEmail, ...(user.planAdmins || [])]
                  .filter(Boolean)
                  .map((email, i) => (
                    <Tag key={i} value={email} />
                  ))}
              </Detail>

              {!user.pro ? (
                <Alert severity="warning">{t('AccountPage.plan.notPro')}</Alert>
              ) : null}

              {user.domain ? (
                <Detail label={t('SubscribePage.domain.title')}>
                  {user.domain}
                </Detail>
              ) : null}
              {onSomebodysPlan && (
                <>
                  {user.planOwner && user.planOwnerEmail ? (
                    <Detail label={t('AccountPage.plan.ownedBy')}>
                      {user.planOwner} ({user.planOwnerEmail})
                    </Detail>
                  ) : null}
                  <Alert severity="info">
                    {t('AccountPage.plan.youAreMember')}
                  </Alert>
                </>
              )}
              {ownsThePlan && (
                <Alert severity="info">
                  {t('AccountPage.plan.youAreOwner')}
                </Alert>
              )}
            </Section>
          ) : null}

          {(ownsThePlan || isPlanAdmin) &&
          user &&
          user.plan &&
          user.plan === 'team' ? (
            <Section title={t('AccountPage.subscription.membersEditor.title')!}>
              <MembersEditor />
            </Section>
          ) : null}

          {admins !== null &&
          ownsThePlan &&
          user &&
          user.plan &&
          user.plan === 'team' ? (
            <Section title={t('AccountPage.subscription.adminsEditor.title')!}>
              <Alert severity="info">
                {t('AccountPage.subscription.adminsEditor.description')}
              </Alert>
              <AdminsEditor admins={admins} onChange={handleEditAdmins} />
            </Section>
          ) : null}

          {ownsThePlan && !isTrial ? (
            <Section title={t('AccountPage.subscription.header')!}>
              {url ? (
                <Button variant="secondary" asChild>
                  <a href={url}>
                    {t('AccountPage.subscription.manageButton')}
                  </a>
                </Button>
              ) : null}
            </Section>
          ) : null}

          {isTrial ? (
            <Section title={t('AccountPage.trial.header')!}>
              <Alert severity="info">
                {t('AccountPage.trial.yourTrialWillExpireIn', {
                  date: formatDistanceToNow(new Date(user.trial!)),
                })}
              </Alert>
              <Button
                variant="secondary"
                onClick={() => navigate('/subscribe')}
              >
                {t('AccountPage.trial.subscribe')}
              </Button>
            </Section>
          ) : null}

          {capabilities.disableAccountDeletion ? null : (
            <Section title={t('AccountPage.deleteAccount.title')!} danger>
              <Alert severity="error">
                {t('AccountPage.deleteAccount.warning')}
              </Alert>

              <Button
                variant="danger"
                onClick={handleDeleteModalOpen}
                data-cy="delete-account-button"
              >
                {t('AccountPage.deleteAccount.deleteData')}
              </Button>

              <DeleteModal
                open={deleteModalOpen}
                user={user}
                onDelete={handleDeleteModalClose}
                onClose={handleDeleteModalClose}
              />
            </Section>
          )}
        </div>
      </Page>
    </>
  );
}

export default AccountPage;
