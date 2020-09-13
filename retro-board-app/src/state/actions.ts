import { Dispatch } from './types';
import { Post, Vote, PostGroup } from 'retro-board-common';

export const TOGGLE_PANEL = 'retrospected/panel/toggle';
export const SET_PLAYERS = 'retrospected/game/players/set';
export const RENAME_SESSION = 'retrospected/game/session/rename';
export const RESET_SESSION = 'retrospected/game/session/reset';
export const RECEIVE_POST = 'retrospected/game/post/receive';
export const RECEIVE_POST_GROUP = 'retrospected/game/group/receive';
export const RECEIVE_VOTE = 'retrospected/game/post/vote/receive';
export const DELETE_POST = 'retrospected/game/post/delete';
export const UPDATE_POST = 'retrospected/game/post/update';
export const DELETE_POST_GROUP = 'retrospected/game/group/delete';
export const UPDATE_POST_GROUP = 'retrospected/game/group/update';
export const RECEIVE_BOARD = 'retrospected/game/board/receive';

const createAction = (type: string, payload?: any) => ({
  type,
  payload,
});

export const togglePanel = (dispatch: Dispatch) => () => {
  dispatch(createAction(TOGGLE_PANEL));
};

export const renameSession = (dispatch: Dispatch) => (name: string) => {
  dispatch(createAction(RENAME_SESSION, name));
};

export const resetSession = (dispatch: Dispatch) => () => {
  dispatch(createAction(RESET_SESSION));
};

export const setPlayers = (dispatch: Dispatch) => (players: string[]) => {
  dispatch(createAction(SET_PLAYERS, players));
};

export const receivePost = (dispatch: Dispatch) => (post: Post) => {
  dispatch(createAction(RECEIVE_POST, post));
};

export const receivePostGroup = (dispatch: Dispatch) => (group: PostGroup) => {
  dispatch(createAction(RECEIVE_POST_GROUP, group));
};

export const receiveBoard = (dispatch: Dispatch) => (posts: Post[]) => {
  dispatch(createAction(RECEIVE_BOARD, posts));
};

export const updatePost = (dispatch: Dispatch) => (post: Post) => {
  dispatch(createAction(UPDATE_POST, post));
};

export const updatePostGroup = (dispatch: Dispatch) => (group: PostGroup) => {
  dispatch(createAction(UPDATE_POST_GROUP, group));
};

export const receiveVote = (dispatch: Dispatch) => (
  postId: string,
  vote: Vote
) => {
  dispatch(createAction(RECEIVE_VOTE, { postId, vote }));
};

export const deletePost = (dispatch: Dispatch) => (post: Post) => {
  dispatch(createAction(DELETE_POST, post));
};

export const deletePostGroup = (dispatch: Dispatch) => (group: PostGroup) => {
  dispatch(createAction(DELETE_POST_GROUP, group));
};
