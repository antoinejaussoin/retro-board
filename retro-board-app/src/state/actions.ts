import { Dispatch } from './types';
import { Post } from 'retro-board-common';

export const TOGGLE_PANEL = 'retrospected/panel/toggle';
export const LOGIN = 'retrospected/user/login';
export const LOGOUT = 'retrospected/user/logout';
export const SET_PLAYERS = 'retrospected/game/players/set';
export const RENAME_SESSION = 'retrospected/game/session/rename';
export const RESET_SESSION = 'retrospected/game/session/reset';
export const RECEIVE_POST = 'retrospected/game/post/receive';
export const DELETE_POST = 'retrospected/game/post/delete';
export const UPDATE_POST = 'retrospected/game/post/update';
export const RECEIVE_BOARD = 'retrospected/game/board/receive';
export const TOGGLE_SUMMARY_MODE =
  'retrospected/game/session/summary-mode/toggle';

const createAction = (type: string, payload?: any) => ({
  type,
  payload,
});

export const togglePanel = (dispatch: Dispatch) => () => {
  dispatch(createAction(TOGGLE_PANEL));
};

export const login = (dispatch: Dispatch) => (username: string, id: string) => {
  localStorage.setItem('user_name', username);
  localStorage.setItem('user_id', id);
  dispatch(
    createAction(LOGIN, {
      id,
      name: username,
    })
  );
};

export const logout = (dispatch: Dispatch) => () => {
  localStorage.removeItem('user_name');
  localStorage.removeItem('user_id');
  dispatch(createAction(LOGOUT));
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

export const receiveBoard = (dispatch: Dispatch) => (posts: Post[]) => {
  dispatch(createAction(RECEIVE_BOARD, posts));
};

export const updatePost = (dispatch: Dispatch) => (post: Post) => {
  dispatch(createAction(UPDATE_POST, post));
};

export const deletePost = (dispatch: Dispatch) => (post: Post) => {
  dispatch(createAction(DELETE_POST, post));
};

export const toggleSummaryMode = (dispatch: Dispatch) => () => {
  dispatch(createAction(TOGGLE_SUMMARY_MODE));
};
