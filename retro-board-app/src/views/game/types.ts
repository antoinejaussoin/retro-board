import { Post, PostGroup } from 'retro-board-common';
import { ColumnSettings } from '../../state/types';

export interface ColumnContent extends ColumnSettings {
  index: number;
  posts: Post[];
  groups: PostGroup[];
}
