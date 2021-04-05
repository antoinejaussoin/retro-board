import { useContext, useReducer, createContext, useMemo } from 'react';
import { State, Action } from './types';
import reducer from './reducer';
import {
  receivePost,
  receivePostGroup,
  deletePost,
  updatePost,
  deletePostGroup,
  updatePostGroup,
  receiveVote,
  receiveBoard,
  renameSession,
  resetSession,
  editOptions,
  editColumns,
  lockSession,
} from './actions';
import { FC } from 'react';

export const initialState: State = {
  session: null,
};

const Context = createContext({
  state: initialState,
  dispatch: (_: Action) => {},
});

interface ProviderProps {
  initialState?: State;
}

export const Provider: FC<ProviderProps> = (props) => {
  const [state, dispatch] = useReducer(
    reducer,
    props.initialState ? props.initialState : initialState
  );
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return <Context.Provider value={value}>{props.children}</Context.Provider>;
};

export function useGlobalState() {
  const { state, dispatch } = useContext(Context);
  const actions = useMemo(() => {
    return {
      receivePost: receivePost(dispatch),
      receivePostGroup: receivePostGroup(dispatch),
      deletePost: deletePost(dispatch),
      updatePost: updatePost(dispatch),
      deletePostGroup: deletePostGroup(dispatch),
      updatePostGroup: updatePostGroup(dispatch),
      receiveVote: receiveVote(dispatch),
      receiveBoard: receiveBoard(dispatch),
      renameSession: renameSession(dispatch),
      resetSession: resetSession(dispatch),
      editOptions: editOptions(dispatch),
      editColumns: editColumns(dispatch),
      lockSession: lockSession(dispatch),
    };
  }, [dispatch]);
  const globalState = useMemo(() => {
    return {
      state,
      ...actions,
    };
  }, [state, actions]);

  return globalState;
}
