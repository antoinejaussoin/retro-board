import 'jest';
import reducer from '../reducer';
import { State } from '../types';
import {
  TOGGLE_PANEL,
  TOGGLE_SUMMARY_MODE,
  LOGIN,
  LOGOUT,
  SET_PLAYERS,
  DELETE_POST,
  RECEIVE_BOARD,
  RECEIVE_POST,
  RENAME_SESSION,
  RESET_SESSION,
  UPDATE_POST,
} from '../actions';
import { Post, PostType } from 'retro-board-common';

function post(id: string): Post {
  return {
    id,
    content: 'foo',
    dislikes: [],
    likes: [],
    postType: PostType.Well,
    user: 'danièle',
  };
}

describe('Global state reducer', () => {
  let state: State;
  beforeEach(() => {
    state = {
      panelOpen: false,
      players: [],
      session: {
        id: '1',
        name: '',
        posts: [],
      },
      summaryMode: false,
      username: 'Alice',
    };
  });
  it('Should toggle the panel on TOGGLE_PANEL', () => {
    state = reducer(state, { type: TOGGLE_PANEL });
    expect(state.panelOpen).toBe(true);
    state = reducer(state, { type: TOGGLE_PANEL });
    expect(state.panelOpen).toBe(false);
    state = reducer(state, { type: TOGGLE_PANEL });
    expect(state.panelOpen).toBe(true);
  });

  it('Should toggle the summary mode on TOGGLE_SUMMARY_MODE', () => {
    state = reducer(state, { type: TOGGLE_SUMMARY_MODE });
    expect(state.summaryMode).toBe(true);
    state = reducer(state, { type: TOGGLE_SUMMARY_MODE });
    expect(state.summaryMode).toBe(false);
    state = reducer(state, { type: TOGGLE_SUMMARY_MODE });
    expect(state.summaryMode).toBe(true);
  });

  it('Should update the username on login', () => {
    state = reducer(state, { type: LOGIN, payload: 'Bob' });
    expect(state.username).toBe('Bob');
  });

  it('Should clear the username on logout', () => {
    state = reducer(state, { type: LOGIN, payload: 'Bob' });
    expect(state.username).toBe('Bob');
    state = reducer(state, { type: LOGOUT });
    expect(state.username).toBe(null);
  });

  it('Should set the players on SET_PLAYERS', () => {
    state = reducer(state, { type: SET_PLAYERS, payload: ['Alice', 'Bob'] });
    expect(state.players).toEqual(['Alice', 'Bob']);
  });

  it('Should replace all posts on RECEIVE_BOARD', () => {
    state = {
      ...state,
      session: {
        ...state.session,
        posts: [post('1')],
      },
    };
    state = reducer(state, {
      type: RECEIVE_BOARD,
      payload: [post('2'), post('3')],
    });
    expect(state.session.posts).toEqual([post('2'), post('3')]);
  });

  it('Should delete the correct post on DELETE_POST', () => {
    state = {
      ...state,
      session: {
        ...state.session,
        posts: [post('1'), post('2'), post('3')],
      },
    };
    state = reducer(state, {
      type: DELETE_POST,
      payload: post('2'),
    });
    expect(state.session.posts).toEqual([post('1'), post('3')]);
  });

  it('Should replace the correct post on UPDATE_POST', () => {
    state = {
      ...state,
      session: {
        ...state.session,
        posts: [post('1'), post('2'), post('3')],
      },
    };
    const editedPost = post('2');
    editedPost.content = 'bar';
    state = reducer(state, {
      type: UPDATE_POST,
      payload: editedPost,
    });
    expect(state.session.posts[0].content).toBe('foo');
    expect(state.session.posts[1].content).toBe('bar');
    expect(state.session.posts[2].content).toBe('foo');
  });

  it('Should add the post to the end of the list on RECEIVE_POST', () => {
    state = {
      ...state,
      session: {
        ...state.session,
        posts: [post('1'), post('2'), post('3')],
      },
    };
    state = reducer(state, {
      type: RECEIVE_POST,
      payload: post('4'),
    });
    expect(state.session.posts).toHaveLength(4);
    expect(state.session.posts[3].id).toBe('4');
  });

  it('Should rename the session on RENAME_SESSION', () => {
    state = {
      ...state,
      session: {
        ...state.session,
        name: 'foo',
      },
    };
    state = reducer(state, {
      type: RENAME_SESSION,
      payload: 'bar',
    });
    expect(state.session.name).toBe('bar');
  });

  it('Should reset the session on RESET_SESSION', () => {
    state = {
      ...state,
      summaryMode: true,
      session: {
        name: 'foo',
        id: '1234',
        posts: [post('1'), post('2'), post('3')],
      },
    };
    state = reducer(state, {
      type: RESET_SESSION,
    });
    expect(state.session.name).toBe('');
    expect(state.session.id).toBe('');
    expect(state.session.posts).toHaveLength(0);
    expect(state.summaryMode).toBe(false);
  });
});
