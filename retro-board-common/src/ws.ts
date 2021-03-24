import {
  ColumnDefinition,
  Post,
  SessionOptions,
  User,
  VoteType,
} from './types';

export interface WsUserData {
  user: User;
}

export interface WsNameData {
  name: string;
}

export interface WsPostUpdatePayload {
  post: Omit<Omit<Post, 'votes'>, 'user'>;
}

export interface WsLikeUpdatePayload {
  type: VoteType;
  postId: string;
}

export interface WsDeletePostPayload {
  postId: string;
}

export interface WsDeleteGroupPayload {
  groupId: string;
}

export interface WsSaveTemplatePayload {
  columns: ColumnDefinition[];
  options: SessionOptions;
}
