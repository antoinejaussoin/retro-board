import { useContext, useReducer, createContext, useMemo, SFC } from 'react';
import { State, Action } from './types';
import reducer from './reducer';
import {
  togglePanel,
  setPlayers,
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
  unauthorized,
} from './actions';

export const initialState: State = {
  panelOpen: false,
  players: [],
  session: null,
  unauthorized: false,
};

const Context = createContext({
  state: initialState,
  dispatch: (_: Action) => {},
});

interface ProviderProps {
  initialState?: State;
}

export const Provider: SFC<ProviderProps> = (props) => {
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
      togglePanel: togglePanel(dispatch),
      setPlayers: setPlayers(dispatch),
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
      unauthorized: unauthorized(dispatch),
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
