import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { Provider, initialState } from '../state/context';
import { State } from '../state/types';

const testingInitialState: State = {
  ...initialState,
  username: { name: 'John Doe', id: 'John Doe' },
};

const AllTheProviders: React.SFC = ({ children }) => {
  return <Provider initialState={testingInitialState}>{children}</Provider>;
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
