import { Translation } from './types';
export default {
  Header: {
    subtitle: 'Uma ótima maneira de reclamar se divertindo',
    logout: 'Logout',
    leave: 'Sair',
    summaryMode: 'Modo Sumário',
  },
  LanguagePicker: {
    header: 'Escolha uma língua',
  },
  Main: {
    hint:
      'Você pode convidar outras pessoas para esta seção compartilhando a URL',
  },
  Post: {
    vote: 'vote',
    votes: 'votos',
    deleteButton: 'Remover',
    noContent: '(This post has no content)',
  },
  PostBoard: {
    notWellQuestion: 'O que poderia ser melhorado?',
    wellQuestion: 'O que deu certo?',
    ideasQuestion: 'Compartilhar uma ideia brilhante?',
  },
  Clients: {
    header: 'Participando conosco agora:',
  },
  Join: {
    welcome: 'Bem-vindo ao Retrospected',
    standardTab: {
      header: 'Crie uma seção',
      text: 'Clique abaixo e inicie a restropectiva:',
      button: 'Crie uma nova seção',
    },
    optionsTab: {
      header: 'Avançado',
      input: 'Insira um nome para sua seção',
      button: 'Crie uma seção customizada',
    },
    previousTab: {
      header: 'Previous sessions',
      rejoinButton: 'Rejoin',
    },
  },
  Login: {
    namePlaceholder: 'Quem é você? Insira seu nome aqui',
    buttonLabel: 'Vamos começar',
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
