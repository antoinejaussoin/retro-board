import type {
  Post,
  PostGroup,
  SessionSettings,
  User,
  VoteExtract,
  VoteType,
} from './types.js';

export interface WebsocketMessage<T> {
  payload: T;
  sessionId: string;
  ack: string;
}

export interface WsUserData {
  user: User;
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

export interface WsReceiveCancelVotesPayload {
  postId: string;
  userId: string;
}

export interface WsDeletePostPayload {
  postId: string;
}

export interface WsCancelVotesPayload {
  postId: string;
}

export interface WsDeleteGroupPayload {
  groupId: string;
}
export interface WsSaveSessionSettingsPayload {
  settings: SessionSettings;
  saveAsTemplate: boolean;
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
  | 'cannot_cancel_votes'
  | 'unknown_error'
  | 'action_unauthorised';

export interface WsErrorPayload {
  type: WsErrorType;
  details: string | null;
}

export interface WsReceiveTimerStartPayload {
  /**
   * Duration in seconds
   */
  duration: number;
}
