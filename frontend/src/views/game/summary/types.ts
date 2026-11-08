import type { Post, PostGroup, User } from 'common';
import type { ColumnContent } from '../types';
import type { ReactionCount } from '../utils';

export interface Stats {
  columns: ColumnStats[];
  actions: ActionItem[];
}

export interface ColumnStats {
  items: ColumnStatsItem[];
  column: ColumnContent;
}

export interface ColumnStatsItem {
  id: string;
  type: 'post' | 'group';
  likes: number;
  dislikes: number;
  reactions: ReactionCount[];
  content: string;
  user: User | null;
  children: ColumnStatsItem[];
  post?: Post;
  group?: PostGroup;
}

export interface ActionItem {
  postId: string;
  postContent: string;
  action: string;
}
