import { Translation } from './types';
export default {
  Header: {
    subtitle: "Un bon moyen de s'exprimer de façon Agile",
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
    by: 'par',
    upVote: 'positif',
    downVote: 'négatif',
    voteRemainingMultiple: (count: number, type: string) =>
      `Il vous reste ${count} votes ${type}s.`,
    voteRemainingOne: (type: string) =>
      `Il ne vous reste plus qu'un vote ${type}, ne le gâchez pas !`,
    voteRemainingNone: (type: string) =>
      `Il ne vous reste plus aucun vote ${type}.`,
  },
  Customize: {
    title: 'Nouvelle session personalisée',
    votingCategory: 'Votes',
    votingCategorySub: 'Règles concernant les votes',
    postCategory: 'Options des posts',
    postCategorySub: `Règles concernant ce qu'un utilisateur peut faire sur un post`,
    customTemplateCategory: 'Colonnes personalisées',
    customTemplateCategorySub:
      'Personnalisez vos colonnes et leur caractèristiques',
    startButton: 'Lancez la session',
    maxUpVotes: 'Nb de votes max (positifs)',
    maxUpVotesHelp: `Réglez le nombre de votes positifs maximum qu'un joueur peut mettre dans une session`,
    maxDownVotes: 'Nb de votes max (négatifs)',
    maxDownVotesHelp: `Réglez le nombre de votes négatifs maximum qu'un joueur peut mettre dans une session`,
    allowSelfVoting: 'Voter pour soi',
    allowSelfVotingHelp: 'Autoriser à voter pour ses propres posts',
    allowMultipleVotes: 'Votes multiples',
    allowMultipleVotesHelp:
      'Autoriser à voter plusieurs fois pour le même post',
    allowActions: 'Activer les Actions',
    allowActionsHelp:
      'Autoriser un utilisateur à entrer une action sur un post',
    allowAuthorVisible: "Afficher l'auteur",
    allowAuthorVisibleHelp: `Afficher l'auteur du post sur le post lui-même.`,
    template: 'Règles prédéfinies',
    templateHelp: 'Sélectionnez un jeu de colonnes prédéfini',
    numberOfColumns: 'Nombre de colonnes',
    numberOfColumnsHelp: 'Réglez le nombre de colonnes',
  },
  PostBoard: {
    customQuestion: 'Question Additionelle',
    notWellQuestion: 'Des améliorations ?',
    wellQuestion: "Qu'est-ce qui s'est bien passé ?",
    ideasQuestion: 'Une bonne idée à partager ?',
    startQuestion: 'Commencer',
    stopQuestion: 'Arrêter',
    continueQuestion: 'Continuer',
    likedQuestion: 'Aimé',
    lackedQuestion: 'A manqué',
    learnedQuestion: 'Appris',
    longedForQuestion: 'A hâte de',
    anchorQuestion: 'Ancre',
    boatQuestion: 'Bateau',
    islandQuestion: 'Île',
    windQuestion: 'Vent',
    rockQuestion: 'Rocher',
  },
  GameMenu: {
    board: 'Board', // Si qqn à une suggestion de traduction...
    summary: 'Résumé',
  },
  Template: {
    default: 'Par défaut',
    wellNotWell: 'Bien / Pas Bien',
    startStopContinue: 'Commencer / Arrêter / Continuer',
    fourLs: 'Les 4 A',
    sailboat: 'Bateau',
  },
  Clients: {
    header: 'Participants:',
  },
  Join: {
    welcome: 'Bienvenue',
    standardTab: {
      header: 'Créer',
      text: 'Cliquez ci-dessous et commencez à retrospecter:',
      button: 'Nouvelle session',
      customizeButton: 'Personnaliser',
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
    namePlaceholder: 'Présentez-vous ! Entrez votre nom ici',
    buttonLabel: "C'est parti !",
    header: 'Se connecter',
  },
  SummaryBoard: {
    noPosts: 'Aucun post à afficher',
    copyAsMarkdown: 'Copier le résumé au format Markdown',
    copyAsRichText: 'Copier le résumé en texte enrichi',
    copySuccessful: 'Vous avez copié le résumé avec succès',
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
  Actions: {
    tooltip: 'Créer une action relative à ce commentaire',
    label: 'Ajouter une action',
    summaryTitle: 'Vos Actions',
    title: 'Action',
  },
} as Translation;
