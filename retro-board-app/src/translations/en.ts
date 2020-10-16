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
  Home: {
    welcome: (userName: string) => `Welcome, ${userName}`,
  },
  PreviousGame: {
    createdBy: 'Created by',
    posts: 'posts',
    participants: 'participants',
    votes: 'votes',
    actions: 'actions',
  },
  Column: {
    createGroupTooltip: 'Create a group to group posts together',
  },
  Group: {
    emptyGroupTitle: 'This is an empty group',
    emptyGroupContent: 'Move a post here to fill this group',
  },
  Post: {
    openExtra: 'Additional features',
    closeExtra: 'Close',
    vote: 'vote',
    votes: 'votes',
    deleteButton: 'Delete',
    setActionButton: 'Set Action',
    setGiphyButton: 'Choose a Giphy image',
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
    toggleGiphyButton: 'Toggle Giphy image',
  },
  Customize: {
    title: 'Customise your Session',
    votingCategory: 'Voting',
    votingCategorySub: 'Set the rules about likes and dislikes',
    postCategory: 'Post settings',
    postCategorySub:
      'Set the rules about what a user can do when creating or viewing a post',
    customTemplateCategory: 'Column Template',
    customTemplateCategorySub:
      'Set the number of columns and their characteristics',
    startButton: 'Start the session',
    editButton: 'Update',
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
    allowGiphy: 'Allow Giphy',
    allowGiphyHelp: 'Allow users to set a Giphy image against a post',
    allowGrouping: 'Allow Grouping',
    allowGroupingHelp: 'Allow the creation of groups to group posts together',
    allowReordering: 'Allow Re-ordering',
    allowReorderingHelp: 'Allow re-ordering posts by drag-and-drop',
    blurCards: 'Blur Cards',
    blurCardsHelp:
      'Cards content is blurred until the moderator reveals the content',
    template: 'Template',
    templateHelp: 'Use a pre-defined set of columns',
    numberOfColumns: 'Number of columns',
    numberOfColumnsHelp: 'Set the number of columns',
    makeDefaultTemplate: 'Make this my default template',
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
    notLoggedIn:
      'You are not logged in. You can view this session as a spectator, but must login to participate.',
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
  AnonymousLogin: {
    namePlaceholder: 'Please enter a name or nickname here to continue',
    buttonLabel: "Let's start",
    header: 'Login',
    anonymousAuthHeader: 'Anonymous Login',
    anonymousAuthDescription:
      "This will create an anonymous account. Some features won't be available.",
    authenticatingWith: 'Authenticating with',
    or: 'or',
  },
  SocialMediaLogin: {
    header: 'Social Media',
    info: 'This will use your account to authenticate you, and will allow you to retrieve all your sessions. No password is stored.',
  },
  AuthCommon: {
    emailField: 'E-mail',
    passwordField: 'Password',
    nameField: 'Your name (for display purposes)',
    passwordScoreWords: ['weak', 'weak', 'not quite', 'good', 'strong'],
  },
  AccountLogin: {
    header: 'Account',
    loginButton: 'Login',
    info: 'Login with your email and password.',
    registerLink: 'Not registered? Click here',
    forgotPasswordLink: 'Forgot your password?',
    errorEmailPasswordIncorrect: 'Your credentials are incorrect.',
  },
  Register: {
    header: 'Register',
    info: 'Get yourself a Retrospected account!',
    registerButton: 'Register',
    errorAlreadyRegistered: 'This email is already registered',
    errorGeneral: 'An error occurred while trying to create your account.',
    messageSuccess: 'Thank you! You should receive an email shortly to validate your account.',
    errorInvalidEmail: 'Please enter a valid email',
  },
  ValidateAccount: {
    success: `Your email has been correctly validated. I'm going to log you in in a sec!`,
    error: 'There was an error validating your email.',
    loading: 'We are validating your email. Please wait.',
  },
  ResetPassword: {
    // Reset Modal
    doneMessage: 'Done! Have a look in your emails, you should get a link to reset your password.',
    header: 'Password Reset',
    resetButton: 'Reset Password',
    info: `Forgot your password? Not a problem. Enter your email below and you'll get a reset email prompto.`,
    // Reset Page
    success: `Your password has been updated. I'm going to log you in in a sec!`,
    error: 'There was an error updating your password.',
    loading: 'We are updating your password. Please wait.',
    resetInfo: 'Please provide a new password',
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
  DeleteSession: {
    header: (name) => `Deleting "${name}" ?`,
    firstLine:
      'Deleting a session is irreversible. It will delete all posts, votes, groups, and the session itself. The data cannot be restored.',
    secondLine:
      'Are you sure you want to delete this session and all its content?',
    yesImSure: `Yes, I'm sure`,
    cancel: `No, I'm sorry, I made a mistake`,
  },
  RevealCards: {
    buttonLabel: 'Reveal',
    dialogTitle: 'Reveal all cards',
    dialogContent:
      'This will reveal all blurred cards for everyone. This cannot be undone.',
    confirmButton: `Let's reveal!`,
    cancelButton: 'No thanks',
  },
} as Translation;
