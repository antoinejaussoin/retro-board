import { PropsWithChildren, useEffect } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { vi } from 'vitest';
import { BackendCapabilities, FullUser, Session, defaultOptions } from 'common';
import {
  DragDropContext,
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot,
} from '@hello-pangea/dnd';
import useSession from '../views/game/useSession';
import { RecoilRoot } from 'recoil';
import { userState } from 'state/user/user-state';

const user: FullUser = {
  id: 'John Doe',
  name: 'John Doe',
  photo: null,
  accountType: 'anonymous',
  language: 'en-GB',
  username: 'johndoe',
  email: 'john@doe.com',
  pro: false,
  stripeId: null,
  currency: null,
  plan: null,
  planOwner: null,
  planOwnerEmail: null,
  planAdmins: null,
  planMembers: null,
  domain: null,
  ownPlan: null,
  ownSubscriptionsId: null,
  trial: null,
  canDeleteSession: false,
  identityId: 'John Doe Identity',
};

export const initialSession: Session = {
  id: 'test-session',
  name: 'My Retro',
  posts: [],
  groups: [],
  columns: [],
  messages: [],
  encrypted: null,
  locked: false,
  createdBy: {
    id: 'John Doe',
    name: 'John Doe',
    photo: null,
    email: null,
  },
  moderator: {
    id: 'John Doe',
    name: 'John Doe',
    photo: null,
    email: null,
  },
  options: {
    ...defaultOptions,
  },
  ready: [],
  timer: null,
  demo: false,
};

const capabilities: BackendCapabilities = {
  adminEmail: 'admin@acme.com',
  ai: false,
  disableAccountDeletion: false,
  disableAnonymous: false,
  disablePasswordRegistration: false,
  disablePasswords: false,
  disableShowAuthor: false,
  emailAvailable: true,
  licenced: true,
  oAuth: {
    github: false,
    google: false,
    microsoft: false,
    okta: false,
    slack: false,
    twitter: false,
  },
  selfHosted: false,
  slackClientId: 'xxx',
};
// fetchBackendCapabilities
vi.mock('../api/index', () => {
  return {
    fetchBackendCapabilities: () => {
      return Promise.resolve(capabilities);
    },
  };
});

export function AllTheProviders({ children }: PropsWithChildren<{}>) {
  return (
    <RecoilRoot
      initializeState={(snap) => {
        snap.set(userState, user);
      }}
    >
      {/* <I18nextProvider i18n={i18n}> */}
      <Inner>{children}</Inner>
      {/* </I18nextProvider> */}
    </RecoilRoot>
  );
}

export default function Inner({ children }: PropsWithChildren<{}>) {
  const { receiveBoard } = useSession();

  useEffect(() => {
    receiveBoard(initialSession);
  }, [receiveBoard]);
  return (
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="test">
        {(dropProvided: DroppableProvided, _: DroppableStateSnapshot) => (
          <div ref={dropProvided.innerRef}>{children}</div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
const customRender = (
  ui: React.ReactElement<any>,
  options?: Omit<RenderOptions, 'queries'>
): RenderResult => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';
export * from '@testing-library/dom';

// override render method
export { customRender as render };
