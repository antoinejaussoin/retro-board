import { Translation } from './types';
export default {
  Header: {
    subtitle: 'A good way of expressing oneself in an Agile way',
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
    by: 'by',
    upVote: 'up-vote',
    downVote: 'down-vote',
    voteRemainingMultiple: (count: number, type: string) =>
      `You have ${count} ${type}s remaining.`,
    voteRemainingOne: (type: string) =>
      `You only have one ${type} remaining, make it count!`,
    voteRemainingNone: (type: string) =>
      `You don't have any ${type} remaining.`,
  },
  Customize: {
    title: 'Customise your Game',
    votingCategory: 'Voting',
    votingCategorySub: 'Set the rules about likes and dislikes',
    postCategory: 'Post settings',
    postCategorySub:
      'Set the rules about what a user can do when creating or viewing a post',
    customTemplateCategory: 'Column Template',
    customTemplateCategorySub:
      'Set the number of columns and their characteristics',
    startButton: 'Start the Meeting!',
    maxUpVotes: 'Max Up-Votes',
    maxUpVotesHelp: `Maximum number of 'likes' votes a user is allowed to cast`,
    maxDownVotes: 'Max Down-Votes',
    maxDownVotesHelp: `Maximum number of 'dislikes' votes a user is allowed to cast`,
    allowSelfVoting: 'Allow Self Voting',
    allowSelfVotingHelp: 'Whether to allow a user to vote on their own post',
    allowMultipleVotes: 'Allow Multiple Votes',
    allowMultipleVotesHelp:
      'Whether to allow a user to vote multiple times on the same post',
    allowActions: 'Allow Actions',
    allowActionsHelp: `Whether to allow the 'Action' (follow-up) field on each post`,
    allowAuthorVisible: 'Show Author',
    allowAuthorVisibleHelp:
      'Display the author of the post, on the post itself.',
    template: 'Template',
    templateHelp: 'Use a pre-defined set of columns',
    numberOfColumns: 'Number of columns',
    numberOfColumnsHelp: 'Set the number of columns',
  },
  PostBoard: {
    customQuestion: 'Custom Column',
    notWellQuestion: 'What could be improved?',
    wellQuestion: 'What went well?',
    ideasQuestion: 'A brilliant idea to share?',
    startQuestion: 'Start',
    stopQuestion: 'Stop',
    continueQuestion: 'Continue',
    likedQuestion: 'Liked',
    lackedQuestion: 'Lacked',
    learnedQuestion: 'Learned',
    longedForQuestion: 'Longed For',
    anchorQuestion: 'Anchor',
    boatQuestion: 'Boat',
    islandQuestion: 'Island',
    windQuestion: 'Wind',
    rockQuestion: 'Rock',
    disconnected: 'You have been disconnected from the current session.',
    reconnect: 'Reconnect',
  },
  GameMenu: {
    board: 'Board',
    summary: 'Summary',
  },
  Template: {
    default: 'Default',
    wellNotWell: 'Well / Not Well',
    startStopContinue: 'Start / Stop / Continue',
    fourLs: 'Four Ls',
    sailboat: 'Sailboat',
  },
  Clients: {
    header: 'Participants:',
  },
  Join: {
    welcome: 'Welcome to Retrospected',
    standardTab: {
      header: 'Create',
      text: 'Click below and start retrospecting:',
      button: 'Create a new session',
      customizeButton: 'Customise',
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
    namePlaceholder: 'Welcome! Please enter your name here to continue',
    buttonLabel: "Let's start",
    header: 'Login',
  },
  SummaryBoard: {
    noPosts: 'There are no posts to display',
    copyAsMarkdown: 'Copy the summary as Markdown',
    copyAsRichText: 'Copy the summary as Rich Text',
    copySuccessful: 'You successfully copied your summary in your clipboard',
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
  Actions: {
    tooltip: 'Create an action on the back of this item',
    label: 'Open the Action panel',
    summaryTitle: 'Your Actions',
    title: 'Action',
  },
} as Translation;
