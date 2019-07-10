import { Translation } from './types';
export default {
  Header: {
    subtitle: 'A good way of ranting in an Agile way',
    logout: 'Logout',
    leave: 'Leave',
    summaryMode: 'Summary Mode',
  },
  LanguagePicker: {
    header: 'Choose a language',
  },
  Main: {
    hint: 'You can invite others to this session by copy-pasting the URL',
  },
  Post: {
    vote: 'vote',
    votes: 'votes',
    deleteButton: 'Delete',
    noContent: '(This post has no content)',
  },
  PostBoard: {
    notWellQuestion: 'What could be improved?',
    wellQuestion: 'What went well?',
    ideasQuestion: 'A brilliant idea to share?',
  },
  Clients: {
    header: 'Kindly joining us right now:',
  },
  Join: {
    welcome: 'Welcome to Retrospected',
    standardTab: {
      header: 'Create',
      text: 'Click below and start retrospecting:',
      button: 'Create a new session',
    },
    optionsTab: {
      header: 'Options',
      input: 'Name',
      button: 'Create custom session',
    },
    previousTab: {
      header: 'Previous',
      rejoinButton: 'Rejoin',
    },
  },
  Login: {
    namePlaceholder: 'Who are you exactly? Enter your name here',
    buttonLabel: "Let's start",
  },
  SummaryBoard: {
    noPosts: 'There are no posts to display',
  },
  SessionName: {
    defaultSessionName: 'My Retrospective',
  },
  Invite: {
    inviteButton: 'Invite',
    dialog: {
      title: 'Invite people to your retrospective',
      text:
        'To invite people to your retrospected session, simply send them ' +
        'the following URL',
      copyButton: 'Copy URL to Clipboard',
    },
  },
  Generic: {
    ok: 'OK',
    cancel: 'Cancel',
  },
} as Translation;
