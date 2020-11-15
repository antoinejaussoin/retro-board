import useGlobalState from '../../../../state';
import useUser from '../../../../auth/useUser';

export default function useCanReveal(): boolean {
  const { state } = useGlobalState();
  const user = useUser();
  return (
    (!!user &&
      state.session &&
      user.id === state.session.createdBy.id &&
      state.session.options.blurCards) ||
    false
  );
}
