import { SessionOptions, Session } from './types';

export const defaultOptions: SessionOptions = {
  allowActions: true,
  allowMultipleVotes: false,
  allowSelfVoting: false,
  allowAuthorVisible: false,
  maxDownVotes: null,
  maxUpVotes: null,
  allowGiphy: true,
  allowGrouping: true,
  allowReordering: true,
};

export const defaultSession: Omit<Session, 'createdBy'> = {
  id: '',
  columns: [
    { id: '', index: 0, label: '', type: 'well', color: '', icon: null },
    { id: '', index: 1, label: '', type: 'notWell', color: '', icon: null },
    { id: '', index: 2, label: '', type: 'ideas', color: '', icon: null },
  ],
  name: null,
  posts: [],
  groups: [],
  options: { ...defaultOptions },
};
