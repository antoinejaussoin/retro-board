import useGlobalState from '../../../../state';

export default function useShouldDisplayEncryptionWarning() {
  const { state } = useGlobalState();

  if (
    state &&
    state.session &&
    state.session.encrypted &&
    !state.session.posts.length
  ) {
    return true;
  }

  return false;
}
