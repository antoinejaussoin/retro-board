export interface Translation {
  Header: {
    subtitle?: string;
    logout?: string;
    leave?: string;
    summaryMode?: string;
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
    maxUpVotes?: string;
    maxUpVotesHelp?: string;
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
    allowGiphy?: string;
    allowGiphyHelp?: string;
    allowGrouping?: string;
    allowGroupingHelp?: string;
    allowReordering?: string;
    allowReorderingHelp?: string;
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
  Login: {
    namePlaceholder?: string;
    buttonLabel?: string;
    header?: string;
    socialMediaAuthHeader?: string;
    socialMediaAuthDescription?: string;
    anonymousAuthHeader?: string;
    anonymousAuthDescription?: string;
    authenticatingWith?: string;
    or?: string;
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
}
