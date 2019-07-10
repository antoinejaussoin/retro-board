import { PostType, Post } from 'retro-board-common';

export interface ColumnContent {
  type: PostType;
  posts: Post[];
  icon: React.ComponentType;
  label: string;
  color: string;
}
