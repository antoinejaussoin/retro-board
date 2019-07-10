export interface Translation {
  Header: {
    subtitle: string;
    logout: string;
    leave: string;
    summaryMode: string;
  };
  LanguagePicker: {
    header: string;
  };
  Main: {
    hint: string;
  };
  Post: {
    vote: string;
    votes: string;
    deleteButton: string;
    noContent: string;
  };
  PostBoard: {
    notWellQuestion: string;
    wellQuestion: string;
    ideasQuestion: string;
  };
  Clients: {
    header: string;
  };
  Join: {
    welcome: string;
    standardTab: {
      header: string;
      text: string;
      button: string;
    };
    optionsTab: {
      header: string;
      input: string;
      button: string;
    };
    previousTab: {
      header: string;
      rejoinButton: string;
    };
  };
  Login: {
    namePlaceholder: string;
    buttonLabel: string;
  };
  SummaryBoard: {
    noPosts: string;
  };
  SessionName: {
    defaultSessionName: string;
  };
  Invite: {
    inviteButton: string;
    dialog: {
      title: string;
      text: string;
      copyButton: string;
    };
  };
  Generic: {
    ok: string;
    cancel: string;
  };
}
