import { Post, PostGroup } from 'common';
import { ColumnSettings } from '../../state/types';

export interface ColumnContent extends ColumnSettings {
  index: number;
  posts: Post[];
  groups: PostGroup[];
}

export interface AckItem {
  ack: string;
  requested: Date;
}
