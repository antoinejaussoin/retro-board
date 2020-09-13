export interface Session extends PostContainer, Entity {
  name: string | null;
  posts: Post[];
  groups: PostGroup[];
  columns: ColumnDefinition[];
  options: SessionOptions;
  createdBy: User;
}

export interface SessionMetadata extends Entity {
  name: string | null;
  participants: User[];
  numberOfPosts: number;
  numberOfPositiveVotes: number;
  numberOfNegativeVotes: number;
  numberOfActions: number;
  created: Date;
  createdBy: User;
}

export interface SessionTemplate extends Entity {
  name: string;
  columns: ColumnDefinition[];
  options: SessionOptions;
  createdBy: User;
}

export interface ColumnDefinition extends Entity {
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
  allowGiphy: boolean;
  allowGrouping: boolean;
  allowReordering: boolean;
}

export interface Entity {
  id: string;
}

export interface Rankable {
  rank: string;
}

export interface PostContainer extends Entity {
  posts: Post[];
}

export interface Post extends Rankable, Entity {
  column: number;
  content: string;
  action: string | null;
  giphy: string | null;
  user: User;
  group: PostGroup | null;
  votes: Vote[];
}

export interface PostGroup extends PostContainer, Rankable, Entity {
  label: string;
  column: number;
  user: User;
}

export interface User extends Entity {
  name: string;
  accountType: AccountType;
  username: string | null;
  photo: string | null;
  language: string;
}

export type AccountType = 'anonymous' | 'google' | 'twitter' | 'github';

export interface Vote extends Entity {
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
  | 'custom-modal/template/set-defaut'
  | 'home/create/default'
  | 'home/load-previous'
  | 'game/session/reset'
  | 'game/session/disconnect'
  | 'game/post/giphy/open'
  | 'game/post/giphy/choose'
  | 'game/post/giphy/toggle'
  | 'game/post/extra-menu/open'
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
