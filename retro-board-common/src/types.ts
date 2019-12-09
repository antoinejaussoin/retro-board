export interface Session extends SessionOptions {
  id: string;
  name: string | null;
  posts: Post[];
  columns: ColumnDefinition[];
}

export interface ColumnDefinition {
  id: string;
  type: ColumnDefinitionType;
  index: number;
  label: string;
  color: string;
  icon: IconName | null;
}

export interface SessionOptions {
  maxUpVotes: number | null;
  maxDownVotes: number | null;
  allowActions: boolean;
  allowSelfVoting: boolean;
  allowMultipleVotes: boolean;
  allowAuthorVisible: boolean;
}

export interface Post {
  id: string;
  column: number;
  content: string;
  action: string | null;
  user: User;
  votes: Vote[];
}

export interface User {
  id: string;
  name: string;
}

export interface Vote {
  id: string;
  user: User;
  type: VoteType;
}

export type VoteType = 'like' | 'dislike';

export type TrackingEvent =
  | 'custom-modal/open'
  | 'custom-modal/close'
  | 'custom-modal/create'
  | 'custom-modal/fail'
  | 'custom-modal/template/select'
  | 'custom-modal/column/change'
  | 'home/create/default'
  | 'game/session/reset'
  | 'game/session/disconnect'
  | 'language/change/';

export type ColumnDefinitionType =
  | 'custom'
  | 'well'
  | 'notWell'
  | 'ideas'
  | 'start'
  | 'stop'
  | 'continue'
  | 'liked'
  | 'learned'
  | 'lacked'
  | 'longedFor'
  | 'anchor'
  | 'cargo'
  | 'island'
  | 'wind'
  | 'rock';

export type IconName =
  | 'satisfied'
  | 'disatisfied'
  | 'sunny'
  | 'announcement'
  | 'file'
  | 'money'
  | 'renew'
  | 'play'
  | 'pause'
  | 'fast-forward'
  | 'liked'
  | 'books'
  | 'help'
  | 'cocktail'
  | 'link'
  | 'boat'
  | 'fitness'
  | 'gesture';
