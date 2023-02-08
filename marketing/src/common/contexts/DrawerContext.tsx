import React, { useReducer } from 'react';

type DrawerContextProps = {
  state: DrawerContextState;
  dispatch: React.Dispatch<Action>;
};

type DrawerContextState = {
  isOpen: boolean;
};

type Action = {
  type: string;
};

const initialState: DrawerContextState = {
  isOpen: false,
};

function reducer(state: DrawerContextState, action: Action) {
  switch (action.type) {
    case 'TOGGLE':
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    default:
      return state;
  }
}
export const DrawerContext = React.createContext<DrawerContextProps>({
  state: initialState,
  dispatch: () => null,
});

export const DrawerProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <DrawerContext.Provider value={{ state, dispatch }}>
      {children}
    </DrawerContext.Provider>
  );
};
