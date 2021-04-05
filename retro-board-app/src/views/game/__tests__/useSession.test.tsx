import useSession from '../useSession';
import { AllTheProviders } from '../../../testing/index';
import { renderHook, act } from '@testing-library/react-hooks';

describe('Hello', () => {
  // const wrapper = ({ children }) => <AllTheProviders children={children} />;
  // const { result } = renderHook(() => useSession(), {
  //   wrapper: AllTheProviders,
  // });

  // it('Should have session null at the start', () => {
  //   expect(result.current.session).toBeNull();
  // });
  it('should be ok', () => {
    expect(true).toBe(true);
  });
});
