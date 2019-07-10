import { Translation } from './types';
export default {
  Header: {
    subtitle: 'Un bon moyen de râler de façon Agile',
    logout: 'Déconnexion',
    leave: 'Sortir',
    summaryMode: 'Mode Résumé',
  },
  LanguagePicker: {
    header: 'Changez de langue',
  },
  Main: {
    hint:
      "Vous pouvez inviter d'autres participants en leur envoyant l'URL de cette page",
  },
  Post: {
    vote: 'vote',
    votes: 'votes',
    deleteButton: 'Supprimer',
    noContent: '(Aucun contenu)',
  },
  PostBoard: {
    notWellQuestion: 'Des améliorations ?',
    wellQuestion: "Qu'est-ce qui s'est bien passé ?",
    ideasQuestion: 'Une bonne idée à partager ?',
  },
  Clients: {
    header: 'Nos invités du moment:',
  },
  Join: {
    welcome: 'Bienvenue',
    standardTab: {
      header: 'Créer',
      text: 'Cliquez ci-dessous et commencez à retrospecter:',
      button: 'Créer une nouvelle session',
    },
    optionsTab: {
      header: 'Options',
      input: 'Donnez un nom à votre session',
      button: 'Créer une session personalisée',
    },
    previousTab: {
      header: 'Précédentes',
      rejoinButton: 'Rejoindre',
    },
  },
  Login: {
    namePlaceholder: 'Qui êtes-vous au juste? Entrez votre nom ici',
    buttonLabel: "C'est parti !",
  },
  SummaryBoard: {
    noPosts: 'Aucun post à afficher',
  },
  SessionName: {
    defaultSessionName: 'Ma Retrospective',
  },
  Invite: {
    inviteButton: 'Inviter',
    dialog: {
      title: 'Invitez des participants à votre retrospective',
      text:
        'Pour inviter des participants à votre session retrospected, ' +
        'envoyez leur le lien suivant',
      copyButton: 'Copier',
    },
  },
  Generic: {
    ok: 'Ok',
    cancel: 'Annuler',
  },
} as Translation;
