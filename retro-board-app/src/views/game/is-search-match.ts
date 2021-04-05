export default function isSearchMatch(
  content: string,
  userName: string,
  search: string,
  blurred: boolean
) {
  if (!search) {
    return true;
  }
  if (blurred) {
    return false;
  }

  return (
    content.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
    userName.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  );
}
