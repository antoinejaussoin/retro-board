import useUser from '../../../../auth/useUser';
import useSession from '../../useSession';

export default function useCanReveal(): boolean {
  const { session } = useSession();
  const user = useUser();
  return (
    (!!user &&
      session &&
      user.id === session.createdBy.id &&
      session.options.blurCards) ||
    false
  );
}
