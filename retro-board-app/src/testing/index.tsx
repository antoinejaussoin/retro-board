import React, { useEffect, useState } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { Provider, initialState } from '../state/context';
import { FullUser } from '@retrospected/common';
import {
  DragDropContext,
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot,
} from 'react-beautiful-dnd';
import UserContext from '../auth/Context';
import { State } from '../state/types';

const testingInitialState: State = {
  ...initialState,
  session: {
    id: 'test-session',
    name: 'My Retro',
    posts: [],
    groups: [],
    columns: [],
    encrypted: null,
    locked: false,
    createdBy: {
      id: 'John Doe',
      name: 'John Doe',
      photo: null,
    },
    options: {
      maxDownVotes: null,
      maxUpVotes: null,
      allowActions: true,
      allowAuthorVisible: false,
      allowMultipleVotes: false,
      allowSelfVoting: false,
      allowGiphy: true,
      allowGrouping: true,
      allowReordering: true,
      blurCards: false,
    },
  },
};

const AllTheProviders: React.FC = ({ children }) => {
  const [user, setUser] = useState<FullUser | null>({
    id: 'John Doe',
    name: 'John Doe',
    photo: null,
    accountType: 'anonymous',
    language: 'en',
    username: 'johndoe',
    email: 'john@doe.com',
    pro: false,
    stripeId: null,
    subscriptionsId: null,
    currency: null,
    plan: null,
    ownPlan: null,
    ownSubscriptionsId: null,
  });
  useEffect(() => {
    setUser({
      id: 'John Doe',
      name: 'John Doe',
      photo: null,
      accountType: 'anonymous',
      language: 'en',
      username: 'johndoe',
      email: 'john@doe.com',
      pro: false,
      stripeId: null,
      subscriptionsId: null,
      currency: null,
      plan: null,
      ownPlan: null,
      ownSubscriptionsId: null,
    });
  }, []);
  return (
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="test">
        {(dropProvided: DroppableProvided, _: DroppableStateSnapshot) => (
          <div ref={dropProvided.innerRef}>
            <UserContext.Provider value={{ user, setUser, initialised: true }}>
              <Provider initialState={testingInitialState}>{children}</Provider>
            </UserContext.Provider>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
const customRender = (
  ui: React.ReactElement<any>,
  options?: Omit<RenderOptions, 'queries'>
): RenderResult => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
