import useGlobalState from '../../../../state';
import useUser from '../../../../auth/useUser';

export default function useCanModifyOptions(): boolean {
  const { state } = useGlobalState();
  const user = useUser();
  return (
    (!!user && state.session && user.id === state.session.createdBy.id) || false
  );
}
