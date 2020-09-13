import React, { useEffect, useState } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { Provider, initialState } from '../state/context';
import { User } from 'retro-board-common';
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
    createdBy: {
      id: 'John Doe',
      name: 'John Doe',
      accountType: 'anonymous',
      photo: null,
      username: 'johndoe',
      language: 'en',
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
    },
  },
};

const AllTheProviders: React.SFC = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 'John Doe',
    name: 'John Doe',
    accountType: 'anonymous',
    photo: null,
    username: 'johndoe',
    language: 'en',
  });
  useEffect(() => {
    setUser({
      id: 'John Doe',
      name: 'John Doe',
      accountType: 'anonymous',
      photo: null,
      username: 'johndoe',
      language: 'en',
    });
  }, []);
  return (
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="test">
        {(
          dropProvided: DroppableProvided,
          dropSnapshot: DroppableStateSnapshot
        ) => (
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
