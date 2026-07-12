import usePortalUrl from './usePortalUrl';
import Button from '@mui/material/Button';
import { Page } from '../../components/Page';
import useUser from '../../state/user/useUser';
import styled from '@emotion/styled';
import ProPill from '../../components/ProPill';
import { Alert } from '@mui/material';
import Section from './Section';
import MembersEditor from './MembersEditor';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useIsTrial from '../../auth/useIsTrial';
import TrialPrompt from '../home/TrialPrompt';
import useFormatDate from '../../hooks/useFormatDate';
import { DeleteModal } from './delete/DeleteModal';
import useModal from '../../hooks/useModal';
import { useCallback, useEffect, useState } from 'react';
import { updateAdmins } from './api';
import LanguagePicker from 'components/LanguagePicker';
import { useLanguage } from 'translations';
import useBackendCapabilities from 'global/useBackendCapabilities';
import AdminsEditor from './AdminEditor';
import Tag from 'components/TagInput/Tag';
import LoginContent from 'auth/modal/LoginContent';
import { noop } from 'lodash';
import { NameEditor } from 'molecules/NameEditor';

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
        <Name>
          <ProPill />
          &nbsp;
          <NameEditor />
        </Name>

        {user.accountType === 'anonymous' ? (
          <Section title={t('AccountPage.convertTitle')!}>
            <Alert severity="warning">{t('AccountPage.convertWarning')}</Alert>
            <LoginContent onClose={noop} anonymous={false} />
          </Section>
        ) : (
          <Section title={t('AccountPage.details.header')!}>
            <Data>
              <Title>{t('AccountPage.details.username')}</Title>
              <Value>{user.username}</Value>
            </Data>

            <Data>
              <Title>{t('AccountPage.details.email')}</Title>
              <Value>{user.email}</Value>
            </Data>

            <Data>
              <Title>{t('AccountPage.details.accountType')}</Title>
              <Value>{user.accountType}</Value>
            </Data>
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
            <Alert severity="info" style={{ marginBottom: 20 }}>
              {t('AccountPage.slack.help')}
            </Alert>
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
            <Data>
              <Title>{t('AccountPage.plan.plan')}</Title>
              <Value>{user.plan}</Value>
            </Data>

            {onSomebodysPlan ? (
              <Data>
                <Title>{t('AccountPage.plan.members')}</Title>
                <Value>
                  {[user.planOwnerEmail, ...(user.planMembers || [])]
                    .filter(Boolean)
                    .map((email, i) => (
                      <Tag key={i} value={email} />
                    ))}
                </Value>
              </Data>
            ) : null}

            <Data>
              <Title>{t('AccountPage.plan.admins')}</Title>
              <Value>
                {[user.planOwnerEmail, ...(user.planAdmins || [])]
                  .filter(Boolean)
                  .map((email, i) => (
                    <Tag key={i} value={email} />
                  ))}
              </Value>
            </Data>

            {!user.pro ? (
              <Alert severity="warning">{t('AccountPage.plan.notPro')}</Alert>
            ) : null}

            {user.domain ? (
              <Data>
                <Title>{t('SubscribePage.domain.title')}</Title>
                <Value>{user.domain}</Value>
              </Data>
            ) : null}
            {onSomebodysPlan && (
              <>
                {user.planOwner && user.planOwnerEmail ? (
                  <Data>
                    <Title>{t('AccountPage.plan.ownedBy')}</Title>
                    <Value>
                      {user.planOwner} ({user.planOwnerEmail})
                    </Value>
                  </Data>
                ) : null}
                <Alert severity="info">
                  {t('AccountPage.plan.youAreMember')}
                </Alert>
              </>
            )}
            {ownsThePlan && (
              <Alert severity="info">{t('AccountPage.plan.youAreOwner')}</Alert>
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
              <Button
                variant="contained"
                color="secondary"
                href={url}
                style={{ marginTop: 20 }}
              >
                {t('AccountPage.subscription.manageButton')}
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
              variant="contained"
              color="secondary"
              style={{ marginTop: 20 }}
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
              color="error"
              variant="contained"
              onClick={handleDeleteModalOpen}
              style={{ marginTop: 20 }}
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
      </Page>
    </>
  );
}

const Name = styled.h1`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 100;
  font-size: 3em;
  margin-left: 20px;
  @media screen and (max-width: 500px) {
    font-size: 1.5em;
  }
`;

const Data = styled.div`
  display: flex;
  align-items: center;
  margin: 15px 0;
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 1.3em;
  width: 200px;

  @media screen and (max-width: 600px) {
    font-size: 1em;
  }
`;

const Value = styled.div`
  font-weight: 100;
  font-size: 1.3em;

  @media screen and (max-width: 600px) {
    font-size: 1em;
  }
`;

export default AccountPage;
