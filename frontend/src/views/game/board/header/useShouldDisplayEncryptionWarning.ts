import useSession from '../../useSession';

export default function useShouldDisplayEncryptionWarning() {
  const { session } = useSession();
  if (session?.encrypted && !session.posts.length) {
    return true;
  }

  return false;
}
