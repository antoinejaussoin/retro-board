import {
  ColumnDefinition,
  Post,
  PostGroup,
  SessionOptions,
  User,
  VoteExtract,
  VoteType,
} from './types';

export interface WebsocketMessage<T> {
  payload: T;
  sessionId: string;
  ack: string;
}

export interface WsUserData {
  user: User;
}

export interface WsNameData {
  name: string;
}

export interface WsPostUpdatePayload {
  post: Omit<Omit<Omit<Post, 'votes'>, 'user'>, 'group'>;
  groupId: string | null;
}

export interface WsGroupUpdatePayload {
  group: Omit<Omit<PostGroup, 'posts'>, 'user'>;
}

export interface WsLikeUpdatePayload {
  type: VoteType;
  postId: string;
}

export interface WsReceiveLikeUpdatePayload {
  postId: string;
  vote: VoteExtract;
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

export interface WsUserReadyPayload {
  userId: string;
  ready: boolean;
  name: string;
}

export type WsErrorType =
  | 'cannot_save_post'
  | 'cannot_save_group'
  | 'cannot_get_session'
  | 'cannot_register_vote'
  | 'cannot_edit_post'
  | 'cannot_edit_group'
  | 'cannot_save_options'
  | 'cannot_save_columns'
  | 'cannot_delete_post'
  | 'cannot_delete_group'
  | 'cannot_rename_session'
  | 'cannot_record_chat_message'
  | 'unknown_error'
  | 'action_unauthorised';

export interface WsErrorPayload {
  type: WsErrorType;
  details: string | null;
}
