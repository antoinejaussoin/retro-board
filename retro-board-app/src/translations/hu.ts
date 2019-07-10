import { Translation } from './types';
export default {
  Header: {
    subtitle: 'Panaszkodjunk rendezetten',
    logout: 'Kijelentkezés',
    leave: 'Távozás',
    summaryMode: 'Összesített mód',
  },
  LanguagePicker: {
    header: 'Válassz nyelvet',
  },
  Main: {
    hint: 'Ha meg akarsz hívni másokat, másold ki és oszd meg velük az URL-t',
  },
  Post: {
    vote: 'szavazat',
    votes: 'szavazat',
    deleteButton: 'törlés',
    noContent: '(This post has no content)',
  },
  PostBoard: {
    notWellQuestion: 'Mit lehetne jobban csinálni?',
    wellQuestion: 'Mit ment jól?',
    ideasQuestion: 'Van valami nagyszerű ötleted?',
  },
  Clients: {
    header: 'Jelenleg itt van:',
  },
  Join: {
    welcome: 'Üdv, ez itt a Retrospected',
    standardTab: {
      header: 'Ülés létrehozása',
      text: 'Kattints ide a kezdéshez:',
      button: 'Új ülés indítása',
    },
    optionsTab: {
      header: 'Haladó',
      input: 'Adj nevet az ülésnek',
      button: 'Ülés létrehozása',
    },
    previousTab: {
      header: 'Previous sessions',
      rejoinButton: 'Rejoin',
    },
  },
  Login: {
    namePlaceholder: 'Hogy is hívnak? Kérlek írd ide a nevedet',
    buttonLabel: 'Kezdjük',
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
