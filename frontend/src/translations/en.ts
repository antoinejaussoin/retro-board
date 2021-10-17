import { WsErrorType } from '@retrospected/common';
import { Translation } from './types';
import { plural } from './utils';
export default {
  Header: {
    subtitle: 'A good way of expressing oneself in an Agile way',
    logout: 'Logout',
    leave: 'Leave',
    summaryMode: 'Summary Mode',
    account: 'My Account',
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
    posts: plural('post'),
    participants: plural('participant'),
    votes: plural('vote'),
    actions: plural('action'),
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
    maxPosts: `Max Posts per user`,
    maxPostsHelp: `Maximum number of posts a user can create per session`,
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
    newPostsFirst: 'Add new posts first',
    newPostsFirstHelp: 'New posts are added at the top of the column',
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
    error: (error: WsErrorType) => {
      switch (error) {
        case 'action_unauthorised':
          return 'You are not allowed to perform this action.';
        case 'cannot_edit_group':
          return 'Editing the group failed.';
        case 'cannot_edit_post':
          return 'Editing the post failed.';
        case 'cannot_get_session':
          return 'Could not get the session data. Please reload the page.';
        case 'cannot_register_vote':
          return 'Your vote was not registered successfully.';
        case 'cannot_save_group':
          return 'The group you created could not be saved.';
        case 'cannot_save_post':
          return 'The post you created could not be saved.';
        case 'cannot_delete_group':
          return 'The group could not be deleted';
        case 'cannot_delete_post':
          return 'The post could not be deleted';
        case 'cannot_rename_session':
          return 'Renaming the session failed';
        case 'cannot_save_columns':
          return 'Saving columns failed';
        case 'cannot_save_options':
          return 'Saving options failed';
        default:
          return 'An unknown error happened';
      }
    },
    maxPostsReached: `You have reached the maximum number of posts set by the moderator.`,
    iAmDone: "I'm done!",
    iAmNotDoneYet: "I'm not done yet...",
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
    joined: (users: string) => `${users} joined.`,
    left: (users: string) => `${users} left.`,
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
    buttonLabel: 'Login',
    header: 'Login',
    anonymousAuthHeader: 'Anonymous Login',
    anonymousAuthDescription:
      "This will create an anonymous account. Some features won't be available.",
    authenticatingWith: 'Authenticating with',
    or: 'or',
  },
  SocialMediaLogin: {
    header: 'OAuth',
    info: 'This will use a third party provider of your choosing to authenticate you. No password is stored.',
  },
  AuthCommon: {
    emailField: 'E-mail',
    passwordField: 'Password',
    nameField: 'Your name (for display purposes)',
    passwordScoreWords: ['weak', 'weak', 'not quite', 'good', 'strong'],
  },
  AccountLogin: {
    header: 'Password',
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
    messageSuccess:
      'Thank you! You should receive an email shortly to validate your account.',
    errorInvalidEmail: 'Please enter a valid email',
  },
  ValidateAccount: {
    success: `Your email has been correctly validated. I'm going to log you in in a sec!`,
    error: 'There was an error validating your email.',
    loading: 'We are validating your email. Please wait.',
  },
  ResetPassword: {
    // Reset Modal
    doneMessage:
      'Done! Have a look in your emails, you should get a link to reset your password.',
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
  AccountPage: {
    anonymousError: `Anonymous accounts cannot have access to their profile (because they don't have one).`,
    details: {
      header: 'Your Details',
      username: 'Username',
      email: 'Email',
      accountType: 'Account Type',
    },
    plan: {
      header: 'Your Plan',
      plan: 'Plan',
      youAreOwner:
        'You are the owner of this plan, through the subscription below.',
      youAreMember: `You are on this plan through somebody else's subscription.`,
    },
    subscription: {
      header: 'Your Subscription',
      manageButton: 'Manage my subscription',
      membersEditor: {
        title: 'Your Team',
        limitReached: (limit) =>
          `You reached the limit of your subscription (${limit} users, including yourself). Please remove members, or upgrade to an unlimited Company account.`,
        info: (
          limit
        ) => `Add emails below to grant Pro accounts to up to ${limit} other
        colleagues. Press Enter after each email address.`,
      },
    },
    trial: {
      header: `Your Trial`,
      yourTrialWillExpireIn: (date: string) =>
        `Your trial will end in ${date}.`,
      subscribe: `Subscribe now`,
    },
  },
  SubscribePage: {
    alertAlreadyPro: `You already are a Pro user, so you might not need another subscription.`,
    alertAlreadySubscribed: `You already have a subscription, so you might not need another subscription.`,
    currency: {
      title: 'Currency',
      description: 'Pick a currency you would like to be billed with',
      warning: (currency: string) =>
        `Your account is already set to use ${currency}, so you cannot change the currency anymore.`,
    },
    plan: {
      title: 'Plan',
      description: 'Choose the plan that fits your use case!',
    },
    domain: {
      title: 'Domain',
      description:
        'Your unlimited subscription applies to a given domain. Any user with this email domain will automatically become a Pro user.',
      invalidDomain:
        'Please provide a valid domain. The domain cannot be a free or disposable email domain.',
    },
    subscribe: {
      title: 'Checkout',
      description: 'You will be redirected to our partner, Stripe, for payment',
      cannotRegisterWithAnon:
        'You need to be logged in with an OAuth or Password account to continue.',
      checkout: 'Checkout',
    },
  },
  SubscribeModal: {
    title: 'Pro Subscription',
    header: 'Retrospected Pro',
    description: `Protect your company's data by subscribing to Retrospected Pro. With Retrospected Pro, get the following features and more:`,
    features: {
      encryptedSession: {
        title: 'Encrypted Sessions',
        description:
          'Your data is encrypted in your browser, making any decryption impossible on the Retrospected server.',
      },
      privateSessions: {
        title: 'Private Sessions',
        description:
          'Make sure only authorised people can access your session.',
      },
      unlimitedPosts: {
        title: 'Unlimited Posts',
        description: 'With a Pro subscription, get unlimited posts.',
      },
    },
    subscribeButton: 'Subscribe',
    payButton: 'Select',
    cancelButton: 'Cancel',
    startTrial: '30-day Trial',
  },
  Products: {
    team: 'Perfect for smaller teams, you can select up to 20 colleagues who will be upgraded to a Pro account.',
    unlimited:
      'If you are a bigger company, you will enjoy an unlimited number of Pro accounts.',
    'self-hosted':
      'Retrospected on premises, one-time fee and unlimited updates. Keep total control of your data, for ever.',
    users: (users: number) => `${users} users`,
    unlimited_seats: 'Unlimited',
    month: 'month',
  },
  Encryption: {
    createEncryptedSession: 'Encrypted Session',
    sessionNotEncrypted: 'This session is not encrypted.',
    sessionEncryptedHaveKeyTooltip: `This session is encrypted, and the key is stored in your browser. You can open this session without having to provide the password again.`,
    sessionEncryptedNoKeyTooltip:
      'This session is encrypted, and the key is not stored in your browser. You will be asked for the decryption key when opening this session.',
    sessionEncryptedWrongKeyTooltip: `This session is encrypted, and the key you have stored is not the correct key.`,
    newEncryptedSessionWarningTitle: `This session is encrypted locally`,
    newEncryptedSessionWarningContent: (key: string) =>
      `It is very important for you to save the full URL (which contains the key) somewhere safe, or at least the encryption key: ${key}. If you lose this encryption key, there is nothing that can be done to retrieve the data.`,
    sessionEncryptionError: `This session is encrypted, and you don't seem to have the decryption key stored locally. Please use the original link, including the decryption key.`,
    passwordModalTitle: `Encrypted Session - Enter Password`,
    passwordModelIncorrect: `The encryption key is incorrect.`,
  },
  Private: {
    lockSuccessNotification:
      'Your session has been successfuly made private. No new participants can join.',
    unlockSuccessNotification:
      'Your session has been successfuly made public. Anyone can join.',
    lockButton: 'Make Private',
    unlockButton: 'Make Public',
    lockDescription:
      'You are about to make the session private. Only the current participants (listed below) will be allowed access to this session once locked.',
    cancelButton: 'Cancel',
    sessionLockedTitle: 'This session is private.',
    sessionLockedDescription:
      'Please ask its moderator to unlock it so you can join. Then, refresh this page.',
    sessionNonProTitle: 'This session is only accessible to Pro users',
    sessionNonProDescription:
      'This session uses features only available to Pro users. Please ask the moderator or subscription holder to give you a Pro account.',
    sessionIsPublic: 'This session is public and accessible to anyone.',
    sessionIsPrivate: 'This session is private, and you have access.',
    sessionIsPrivateNoAccess:
      'This session is private, but you do not have access.',
  },
  TrialPrompt: {
    allowanceReachedTitle: 'You have reached your free allowance',
    allowanceReachedDescription: `In order to get unlimited posts, please  subscribe to Retrospected Pro`,
    nearEndAllowanceTitle: 'You are nearing the end of your quota',
    nearEndAllowanceDescription: (quota) =>
      `You have about ${quota} posts left`,
    onTrialTitle: 'Retrospected Pro - Trial',
    remainingTrialSentence: (remaining) =>
      `You have ${remaining} left on your trial.`,
    trialEndedTitle: 'Your Retrospected Pro Trial has ended',
    trialEndedSentence: 'Subscribe today to regain access to the Pro features.',
    subscribeNow: 'Subscribe now!',
  },
} as Translation;
