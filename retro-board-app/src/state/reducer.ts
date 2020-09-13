import findIndex from 'lodash/findIndex';
import { State, Action } from './types';
import {
  TOGGLE_PANEL,
  SET_PLAYERS,
  RECEIVE_POST,
  RECEIVE_POST_GROUP,
  DELETE_POST,
  UPDATE_POST,
  DELETE_POST_GROUP,
  UPDATE_POST_GROUP,
  RECEIVE_BOARD,
  RENAME_SESSION,
  RESET_SESSION,
  RECEIVE_VOTE,
} from './actions';

export default (state: State, action: Action): State => {
  switch (action.type) {
    case TOGGLE_PANEL:
      return { ...state, panelOpen: !state.panelOpen };
    case SET_PLAYERS:
      return { ...state, players: action.payload };
    case RECEIVE_POST:
      if (!state.session) {
        return state;
      }
      return {
        ...state,
        session: {
          ...state.session,
          posts: [...state.session.posts, action.payload],
        },
      };
    case RECEIVE_POST_GROUP:
      if (!state.session) {
        return state;
      }
      return {
        ...state,
        session: {
          ...state.session,
          groups: [...state.session.groups, action.payload],
        },
      };
    case RECEIVE_VOTE:
      if (!state.session) {
        return state;
      }
      const postIndex = findIndex(
        state.session.posts,
        p => p.id === action.payload.postId
      );
      const post = state.session.posts[postIndex];

      if (!post) {
        return state;
      }

      return {
        ...state,
        session: {
          ...state.session,
          posts: [
            ...state.session.posts.slice(0, postIndex),
            {
              ...post,
              votes: [...post.votes, action.payload.vote],
            },
            ...state.session.posts.slice(postIndex + 1),
          ],
        },
      };
    case DELETE_POST:
      if (!state.session) {
        return state;
      }
      return {
        ...state,
        session: {
          ...state.session,
          posts: state.session.posts.filter(p => p.id !== action.payload.id),
        },
      };
    case DELETE_POST_GROUP:
      if (!state.session) {
        return state;
      }
      return {
        ...state,
        session: {
          ...state.session,
          groups: state.session.groups.filter(g => g.id !== action.payload.id),
          posts: state.session.posts.map(p =>
            p.group && p.group.id === action.payload.id
              ? {
                  ...p,
                  group: null,
                }
              : p
          ),
        },
      };
    case UPDATE_POST:
      if (!state.session) {
        return state;
      }
      const index = findIndex(
        state.session.posts,
        p => p.id === action.payload.id
      );
      if (index === -1) {
        return state;
      }
      return {
        ...state,
        session: {
          ...state.session,
          posts: [
            ...state.session.posts.slice(0, index),
            action.payload,
            ...state.session.posts.slice(index + 1),
          ],
        },
      };
    case UPDATE_POST_GROUP:
      if (!state.session) {
        return state;
      }
      const groupIndex = findIndex(
        state.session.groups,
        g => g.id === action.payload.id
      );
      if (groupIndex === -1) {
        return state;
      }
      return {
        ...state,
        session: {
          ...state.session,
          groups: [
            ...state.session.groups.slice(0, groupIndex),
            action.payload,
            ...state.session.groups.slice(groupIndex + 1),
          ],
        },
      };
    case RECEIVE_BOARD:
      return {
        ...state,
        session: action.payload,
      };
    case RENAME_SESSION:
      if (!state.session) {
        return state;
      }
      return {
        ...state,
        session: {
          ...state.session,
          name: action.payload,
        },
      };
    case RESET_SESSION:
      return {
        ...state,
        session: null,
      };
    default:
      return state;
  }
};
