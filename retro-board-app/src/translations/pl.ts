import { Translation } from './types';
export default {
  Header: {
    subtitle: 'Dobry sposób by ponarzekać zgodnie z duchem Agile',
    logout: 'Wyloguj',
    leave: 'Wyjdź',
    summaryMode: 'Tryb Podsumowania',
  },
  LanguagePicker: {
    header: 'Wybierz język',
  },
  Main: {
    hint: 'Możesz zaprosić inne osoby do tej sesji wysyłając im URL',
  },
  Post: {
    vote: 'głos',
    votes: 'głosów',
    deleteButton: 'Usuń',
    noContent: '(Ten wpis nie ma zawartości)',
  },
  PostBoard: {
    notWellQuestion: 'Co można poprawić?',
    wellQuestion: 'Co poszło dobrze?',
    ideasQuestion: 'Wspaniały pomysł którym chcesz się podzielić?',
  },
  Clients: {
    header: 'Są dziś z nami:',
  },
  Join: {
    welcome: 'Witaj w Retrospected',
    standardTab: {
      header: 'Stwórz',
      text: 'Kliknij poniżej i zacznij retrospektywę:',
      button: 'Stwórz nową sesję',
    },
    optionsTab: {
      header: 'Zaawansowane',
      input: 'Imię',
      button: 'Stwórz custom session',
    },
    previousTab: {
      header: 'Poprzednie',
      rejoinButton: 'Dołącz ponownie',
    },
  },
  Login: {
    namePlaceholder: 'Kim dokładnie jesteś? Wprowadź tu swoje imię',
    buttonLabel: 'Zacznijmy',
  },
  SummaryBoard: {
    noPosts: 'Nie ma wpisów do wyświetlenia',
  },
  SessionName: {
    defaultSessionName: 'Moja Retrospektywa',
  },
  Invite: {
    inviteButton: 'Zaproś',
    dialog: {
      title: 'Zaproś ludzi do swojej retrospektywy',
      text:
        'By zaprosić ludzi do swojej retrospektywy, po prostu wyślij im ' +
        'następujący URL',
      copyButton: 'Skopiuj URL do Schowka',
    },
  },
  Generic: {
    ok: 'OK',
    cancel: 'Cancel',
  },
} as Translation;
