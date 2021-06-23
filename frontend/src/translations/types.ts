import { WsErrorType } from '@retrospected/common';

export interface Translation {
  Header: {
    subtitle?: string;
    logout?: string;
    leave?: string;
    summaryMode?: string;
    account?: string;
  };
  LanguagePicker: {
    header?: string;
  };
  Main: {
    hint?: string;
  };
  Home: {
    welcome?: (userName: string) => string;
  };
  PreviousGame: {
    createdBy?: string;
    posts?: string;
    participants?: string;
    votes?: string;
    actions?: string;
  };
  Column: {
    createGroupTooltip?: string;
  };
  Group: {
    emptyGroupTitle?: string;
    emptyGroupContent?: string;
  };
  Post: {
    openExtra?: string;
    closeExtra?: string;
    vote?: string;
    votes?: string;
    deleteButton?: string;
    setActionButton?: string;
    setGiphyButton?: string;
    noContent?: string;
    by?: string;
    upVote?: string;
    downVote?: string;
    voteRemainingMultiple?: (count: number, type: string) => string;
    voteRemainingOne?: (type: string) => string;
    voteRemainingNone?: (type: string) => string;
    toggleGiphyButton?: string;
  };
  Customize: {
    title?: string;
    votingCategory?: string;
    votingCategorySub?: string;
    postCategory?: string;
    postCategorySub?: string;
    customTemplateCategory?: string;
    customTemplateCategorySub?: string;
    startButton?: string;
    editButton?: string;
    maxUpVotes?: string;
    maxUpVotesHelp?: string;
    maxPosts?: string;
    maxPostsHelp?: string;
    maxDownVotes?: string;
    maxDownVotesHelp?: string;
    allowSelfVoting?: string;
    allowSelfVotingHelp?: string;
    allowMultipleVotes?: string;
    allowMultipleVotesHelp?: string;
    allowActions?: string;
    allowActionsHelp?: string;
    allowAuthorVisible?: string;
    allowAuthorVisibleHelp?: string;
    newPostsFirst?: string;
    newPostsFirstHelp?: string;
    allowGiphy?: string;
    allowGiphyHelp?: string;
    allowGrouping?: string;
    allowGroupingHelp?: string;
    allowReordering?: string;
    allowReorderingHelp?: string;
    blurCards?: string;
    blurCardsHelp?: string;
    template?: string;
    templateHelp?: string;
    numberOfColumns?: string;
    numberOfColumnsHelp?: string;
    makeDefaultTemplate?: string;
  };
  PostBoard: {
    customQuestion?: string;
    notWellQuestion?: string;
    wellQuestion?: string;
    ideasQuestion?: string;
    startQuestion?: string;
    stopQuestion?: string;
    continueQuestion?: string;
    likedQuestion?: string;
    lackedQuestion?: string;
    learnedQuestion?: string;
    longedForQuestion?: string;
    anchorQuestion?: string;
    boatQuestion?: string;
    islandQuestion?: string;
    windQuestion?: string;
    rockQuestion?: string;
    disconnected?: string;
    reconnect?: string;
    notLoggedIn?: string;
    error?: (error: WsErrorType) => string;
    maxPostsReached?: string;
  };
  GameMenu: {
    board?: string;
    summary?: string;
  };
  Template: {
    default?: string;
    wellNotWell?: string;
    startStopContinue?: string;
    fourLs?: string;
    sailboat?: string;
  };
  Clients: {
    header?: string;
    joined?: (users: string) => string;
    left?: (users: string) => string;
  };
  Join: {
    welcome?: string;
    standardTab: {
      header?: string;
      text?: string;
      button?: string;
      customizeButton?: string;
    };
    optionsTab: {
      header?: string;
      input?: string;
      button?: string;
    };
    previousTab: {
      header?: string;
      rejoinButton?: string;
    };
  };
  AnonymousLogin: {
    namePlaceholder?: string;
    buttonLabel?: string;
    header?: string;
    anonymousAuthHeader?: string;
    anonymousAuthDescription?: string;
    authenticatingWith?: string;
    or?: string;
  };
  SocialMediaLogin: {
    header?: string;
    info?: string;
  };
  AuthCommon: {
    emailField?: string;
    passwordField?: string;
    nameField?: string;
    passwordScoreWords?: string[];
  };
  AccountLogin: {
    header?: string;
    loginButton?: string;
    info?: string;
    registerLink?: string;
    forgotPasswordLink?: string;
    errorEmailPasswordIncorrect?: string;
  };
  Register: {
    header?: string;
    info?: string;
    registerButton?: string;
    errorAlreadyRegistered?: string;
    errorGeneral?: string;
    messageSuccess?: string;
    errorInvalidEmail?: string;
  };
  ValidateAccount: {
    success?: string;
    error?: string;
    loading?: string;
  };
  ResetPassword: {
    // Reset Modal
    doneMessage?: string;
    header?: string;
    resetButton?: string;
    info?: string;
    // Reset Page
    success?: string;
    error?: string;
    loading?: string;
    resetInfo?: string;
  };
  SummaryBoard: {
    noPosts?: string;
    copyAsMarkdown?: string;
    copyAsRichText?: string;
    copySuccessful?: string;
  };
  SessionName: {
    defaultSessionName?: string;
  };
  Invite: {
    inviteButton?: string;
    dialog: {
      title?: string;
      text?: string;
      copyButton?: string;
    };
  };
  Generic: {
    ok?: string;
    cancel?: string;
  };
  Actions: {
    label?: string;
    tooltip?: string;
    title?: string;
    summaryTitle?: string;
  };
  DeleteSession: {
    header?: (sessionName: string) => string;
    firstLine?: string;
    secondLine?: string;
    yesImSure?: string;
    cancel?: string;
  };
  RevealCards: {
    buttonLabel?: string;
    dialogTitle?: string;
    dialogContent?: string;
    confirmButton?: string;
    cancelButton?: string;
  };
  AccountPage: {
    anonymousError?: string;
    details: {
      header?: string;
      username?: string;
      email?: string;
      accountType?: string;
    };
    plan: {
      header?: string;
      plan?: string;
      youAreOwner?: string;
      youAreMember?: string;
    };
    subscription: {
      header?: string;
      manageButton?: string;
      membersEditor: {
        title?: string;
        limitReached?: (limit: number) => string;
        info?: (limit: number) => string;
      };
    };
    trial: {
      header?: string;
      yourTrialWillExpireIn?: (date: string) => string;
      subscribe?: string;
    };
  };
  SubscribePage: {
    alertAlreadyPro?: string;
    alertAlreadySubscribed?: string;
    currency: {
      title?: string;
      description?: string;
      warning?: (currency: string) => string;
    };
    plan: {
      title?: string;
      description?: string;
    };
    domain: {
      title?: string;
      description?: string;
      invalidDomain?: string;
    };
    subscribe: {
      title?: string;
      description?: string;
      cannotRegisterWithAnon?: string;
      checkout?: string;
    };
  };
  SubscribeModal: {
    title?: string;
    header?: string;
    description?: string;
    features: {
      encryptedSession: {
        title?: string;
        description?: string;
      };
      privateSessions: {
        title?: string;
        description?: string;
      };
      unlimitedPosts: {
        title?: string;
        description?: string;
      };
    };
    subscribeButton?: string;
    cancelButton?: string;
    startTrial?: string;
  };
  Products: {
    team?: string;
    unlimited?: string;
    users?: (users: number) => string;
    unlimited_seats?: string;
    month?: string;
  };
  Encryption: {
    createEncryptedSession?: string;
    sessionNotEncrypted?: string;
    sessionEncryptedHaveKeyTooltip?: string;
    sessionEncryptedNoKeyTooltip?: string;
    sessionEncryptedWrongKeyTooltip?: string;
    newEncryptedSessionWarningTitle?: string;
    newEncryptedSessionWarningContent?: (key: string) => string;
    sessionEncryptionError?: string;
    passwordModalTitle?: string;
    passwordModelIncorrect?: string;
  };
  Private: {
    lockSuccessNotification?: string;
    unlockSuccessNotification?: string;
    lockButton?: string;
    unlockButton?: string;
    lockDescription?: string;
    cancelButton?: string;
    sessionLockedTitle?: string;
    sessionLockedDescription?: string;
    sessionNonProTitle?: string;
    sessionNonProDescription?: string;
    sessionIsPublic?: string;
    sessionIsPrivate?: string;
    sessionIsPrivateNoAccess?: string;
  };
  TrialPrompt: {
    allowanceReachedTitle?: string;
    allowanceReachedDescription?: string;
    nearEndAllowanceTitle?: string;
    nearEndAllowanceDescription?: (quota: number | null) => string;
    onTrialTitle?: string;
    remainingTrialSentence?: (remaining: string) => string;
    trialEndedTitle?: string;
    trialEndedSentence?: string;
    subscribeNow?: string;
  };
}
