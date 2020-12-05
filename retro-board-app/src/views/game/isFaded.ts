import { Post } from '@retrospected/common';

export default function isFaded(post: Post, search: string, blurred: boolean) {
  if (!search) {
    return false;
  }
  if (search && blurred) {
    return true;
  }

  return !post.content.toLocaleLowerCase().includes(search.toLocaleLowerCase());
}
