export default function isFaded(
  content: string,
  search: string,
  blurred: boolean
) {
  if (!search) {
    return false;
  }
  if (search && blurred) {
    return true;
  }

  return !content.toLocaleLowerCase().includes(search.toLocaleLowerCase());
}
