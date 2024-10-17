import type { Session, SessionOptions } from './types.js';

export const defaultOptions: SessionOptions = {
  allowActions: true,
  allowMultipleVotes: false,
  allowSelfVoting: false,
  allowAuthorVisible: false,
  maxDownVotes: null,
  maxUpVotes: null,
  maxPosts: null,
  allowGiphy: true,
  allowGrouping: true,
  allowReordering: true,
  allowCancelVote: true,
  blurCards: false,
  newPostsFirst: true,
  allowTimer: true,
  timerDuration: 15 * 60,
  readonlyOnTimerEnd: true,
  restrictTitleEditToModerator: false,
  restrictReorderingToModerator: false,
  restrictGroupingToModerator: false,
};

export const defaultSession: Omit<Session, 'createdBy' | 'moderator'> = {
  id: '',
  columns: [
    { id: '', index: 0, label: '', type: 'well', color: '', icon: null },
    { id: '', index: 1, label: '', type: 'notWell', color: '', icon: null },
    { id: '', index: 2, label: '', type: 'ideas', color: '', icon: null },
  ],
  name: null,
  posts: [],
  groups: [],
  messages: [],
  options: { ...defaultOptions },
  encrypted: null,
  locked: false,
  ready: [],
  timer: null,
  demo: false,
};
