import { Translation } from './types';
export default {
  Header: {
    subtitle: "Un bon moyen de s'exprimer de façon Agile",
    logout: 'Déconnexion',
    leave: 'Sortir',
    summaryMode: 'Mode Résumé',
    account: 'Mon compte',
  },
  LanguagePicker: {
    header: 'Changez de langue',
  },
  Main: {
    hint:
      "Vous pouvez inviter d'autres participants en leur envoyant l'URL de cette page",
  },
  Home: {
    welcome: (userName: string) => `Bienvenue, ${userName}`,
  },
  PreviousGame: {
    createdBy: 'Créé par',
    posts: 'posts',
    participants: 'participants',
    votes: 'votes',
    actions: 'actions',
  },
  Column: {
    createGroupTooltip: 'Créer un groupe',
  },
  Group: {
    emptyGroupTitle: 'Ce groupe est vide',
    emptyGroupContent: 'Déplacez un post ici pour le remplir',
  },
  Post: {
    openExtra: 'Fonctions supplémentaires',
    closeExtra: 'Fermer',
    vote: 'vote',
    votes: 'votes',
    deleteButton: 'Supprimer',
    setActionButton: 'Définir une action',
    setGiphyButton: 'Choisir une image Giphy',
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
    toggleGiphyButton: "Montrer/Cacher l'image Giphy",
  },
  Customize: {
    title: 'Nouvelle session personalisée',
    votingCategory: 'Votes',
    votingCategorySub: 'Règles concernant les votes',
    postCategory: 'Options des posts',
    postCategorySub: `Règles concernant ce qu'un utilisateur peut faire sur un post`,
    customTemplateCategory: 'Colonnes personalisées',
    customTemplateCategorySub:
      'Personnalisez vos colonnes et leur caractéristiques',
    startButton: 'Lancez la session',
    maxUpVotes: 'Nb de votes max (positifs)',
    maxUpVotesHelp: `Réglez le nombre de votes positifs maximum qu'un participant peut mettre dans une session`,
    maxDownVotes: 'Nb de votes max (négatifs)',
    maxDownVotesHelp: `Réglez le nombre de votes négatifs maximum qu'un participant peut mettre dans une session`,
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
    allowGiphy: 'Activer Giphy',
    allowGiphyHelp:
      "Autoriser les utilisateurs à ajouter une image Giphy sur n'importe quel post",
    allowGrouping: 'Groupes',
    allowGroupingHelp:
      'Permettre aux utilisateurs de grouper les posts par groupes',
    allowReordering: 'Re-organiser',
    allowReorderingHelp:
      "Permettre aux utilisateurs de réorganiser l'ordre des posts",
    blurCards: 'Flouter',
    blurCardsHelp: `Les posts sont floutés, jusqu'à ce qu'un modérateur révèle les posts`,
    template: 'Règles prédéfinies',
    templateHelp: 'Sélectionnez un jeu de colonnes prédéfini',
    numberOfColumns: 'Nombre de colonnes',
    numberOfColumnsHelp: 'Réglez le nombre de colonnes',
    makeDefaultTemplate: 'En faire mes réglages par défaut',
  },
  PostBoard: {
    customQuestion: 'Question Additionelle',
    notWellQuestion: 'Des améliorations ?',
    wellQuestion: "Qu'est-ce qui s'est bien passé ?",
    ideasQuestion: 'Une bonne idée à partager ?',
    startQuestion: 'Commencer',
    editButton: 'Mettre à jour',
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
    disconnected: 'Vous avez été déconnecté de la session.',
    reconnect: 'Se reconnecter',
    notLoggedIn:
      "Vous n'êtes pas connecté. Vous pouvez regarder cette session en tant que spectateur, mais vous devez vous connecter pour participer.",
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
  AnonymousLogin: {
    namePlaceholder: 'Présentez-vous ! Entrez votre nom ici',
    buttonLabel: "C'est parti !",
    header: 'Se connecter',
    anonymousAuthHeader: 'Identification Anonyme',
    anonymousAuthDescription:
      'Ceci va créer un compte anonyme, certaines fonctionalitées ne seront pas disponibles.',
    authenticatingWith: 'Identification avec',
    or: 'ou',
  },
  SocialMediaLogin: {
    header: 'Réseaux Sociaux',
    info:
      'Vous allez utiliser un de vos comptes existant pour vous identifier. Vous pourrez visualiser vos précédentes sessions. Aucun mot de passe ne sera stocké.',
  },
  AuthCommon: {
    emailField: 'Adresse e-mail',
    passwordField: 'Mot de passe',
    nameField: 'Votre nom (ou pseudo)',
    passwordScoreWords: [
      'faible',
      'faible',
      'encore un effort',
      'suffisant',
      'très bien!',
    ],
  },
  AccountLogin: {
    header: 'Classique',
    loginButton: 'Se connecter',
    info: 'Connectez-vous avec votre email et votre mot de passe.',
    registerLink: 'Pas de compte ? Cliquez ici',
    forgotPasswordLink: 'Mot de passe oublié ?',
    errorEmailPasswordIncorrect:
      'Les identifiants communiqués sont incorrects.',
  },
  Register: {
    header: `S'enregistrer`,
    info: 'Enregistrez un nouveau compte Retrospected.',
    registerButton: 'Créer un compte',
    errorAlreadyRegistered: 'Désolé, cet email est déjà enregistré',
    errorGeneral: 'Une error est survenue lors de la création de votre compte.',
    messageSuccess:
      'Merci ! Vous devriez reçevoir un email pour valider votre compte.',
    errorInvalidEmail: `Merci d'entrer un email valide`,
  },
  ValidateAccount: {
    success: `Votre email a été validé. Ne bougez pas, je vous connecte dans quelques secondes.`,
    error:
      'Une erreur est survenue lors de la validation de votre adresse e-mail.',
    loading: 'Nous validons votre e-mail... Merci de votre patience.',
  },
  ResetPassword: {
    // Reset Modal
    doneMessage: `C'est fait ! Jetez un oeuil dans votre boîte email, vous devriez reçevoir un email pour mettre à jour votre mot de passe.`,
    header: 'Changer de mot de passe',
    resetButton: 'Mettre à jour',
    info:
      'Vous avez oublié votre mot de passe ? Pas de problème, entrez votre email et vous recevrez un email en retour.',
    // Reset Page
    success: `Votre mot de passe a été mis à jour. Je vais vous connecter dans quelques secondes.`,
    error:
      'Une erreur est survenue lors de la mise à jour de votre mot de passe.',
    loading: 'Nous mettons votre mot de passe à jour. Merci de patienter.',
    resetInfo: 'Merci de choisir un nouveau mot de passe:',
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
  DeleteSession: {
    header: (name) => `Supprimer "${name}" ?`,
    firstLine:
      'Effacer une session est irreversible. Tout les posts, groupes, votes et la session elle-même vont être effacés. Les données ne peuvent être récupérée.',
    secondLine:
      'Êtes-vous certain(e) de vouloir effaçer cette session et son contenu ?',
    yesImSure: `Oui, j'en suis sûr`,
    cancel: 'Non, je me suis trompé(e)',
  },
  RevealCards: {
    buttonLabel: 'Révéler',
    dialogTitle: 'Révéler tous les posts',
    dialogContent: `Cela va révéler (déflouter) tout les posts. L'opération n'est pas reversible.`,
    confirmButton: `Révéler`,
    cancelButton: 'Non merci',
  },
  AccountPage: {
    anonymousError: `Les comptes anonymes ne peuvent avoir accès à leur profile (puisque ils n'en ont pas).`,
    details: {
      header: 'Vos Coordonnées',
      username: `Nom d'utilisateur`,
      email: 'E-Mail',
      accountType: 'Type de compte',
    },
    plan: {
      header: 'Votre Accès',
      plan: 'Accès',
      youAreOwner: `Vous êtes l'administrateur de cet abonnement. Vous pouvez le gérer via la section ci-dessous.`,
      youAreMember: `Vous devez votre accès Pro grâce à l'abonnement d'un tiers.`,
    },
    subscription: {
      header: 'Votre Abonnement',
      manageButton: 'Gérer mon abonnement',
      membersEditor: {
        title: 'Votre Equipe',
        limitReached: (limit) =>
          `Vous avez atteint le nombre maximum de membres (${limit}) permis par votre abonnement. Vous pouvez passer à l'abonnement Company pour un nombre de collaborateur illimité.`,
        info: (limit) =>
          `Ajouter des addresses emails ci-dessous pour donner un accès Pro à vos collaborateurs (dans la limite de ${limit} collaborateurs).`,
      },
    },
  },
  SubscribePage: {
    alertAlreadyPro: `Vous avez déjà un compte Pro, vous n'avez peut-être donc pas besoin d'un abonnement supplémentaire.`,
    alertAlreadySubscribed: `Vous avez déjà un abonnement, vous n'avez peut-être donc pas besoin d'un abonnement supplémentaire.`,
    currency: {
      title: 'Devise',
      description: 'Choisissez une devise de facturation.',
      warning: (currency: string) =>
        `Votre compte est déjà en ${currency}, vous ne pouvez donc plus en changer.`,
    },
    plan: {
      title: 'Abonnement',
      description: `Choisissez l'abonnement qui vous convient`,
    },
    domain: {
      title: 'Nom de domaine',
      description:
        'Votre abonnement illimité est basé sur le nom de domaine de votre email.',
      invalidDomain: `Merci d'entrer un nom de domaine valide.`,
    },
    subscribe: {
      title: 'Payer',
      description: `Vous serez redirigé vers notre partenaire Stripe. Aucune coordonnées bancaire n'est stockée par Retrospected.`,
      cannotRegisterWithAnon: `Vous ne pouvez vous abonner en utilisant un compte anonyme. Merci de vous enregistrer avec un compte classique (mot de passe) ou via un l'authentification tierce (Google, Github).`,
      checkout: 'Payer',
    },
  },
  SubscribeModal: {
    title: 'Abonnement Pro',
    header: 'Retrospected Pro',
    description: `Protégez les données de votre entreprise en vous abonnant à Retrospected Pro. Pour seulement 9.90 €, bénéficiez des fonctionalités suivantes:`,
    features: {
      encryptedSession: {
        title: 'Session Cryptées',
        description:
          'Vos données sont cryptées localement, sur votre navigateur, les rendant impossible à déchiffrer sur le serveur.',
      },
      sessionLocking: {
        title: 'Session restreintes',
        description:
          'Assurez-vous que seules les personnes choisies puissent accéder à votre session.',
      },
    },
    subscribeButton: `S'abonner`,
    cancelButton: `Annuler`,
  },
  Products: {
    team: `Parfait pour une équipe, vous pouvez sélectioner jusqu'à 20 collègues qui recevront un compte Retrospected Pro.`,
    unlimited: `Si vous avez besoin de plus, l'abonnement "Pro Unlimited" vous donnera un nombre de compte Pro illimité`,
    users: (users: number) => `${users} utilisateurs`,
    unlimited_seats: 'Illimité',
    month: 'mois',
  },
  Encryption: {
    createEncryptedSession: 'Session cryptée',
    sessionEncryptedHaveKeyTooltip: `Cette session est chiffrée, et la clef est stockée dans votre navigateur. Vous pouvez ouvrir cette session sans avoir à en donner le mot de passe.`,
    sessionEncryptedNoKeyTooltip: `Cette session est chiffrée, et la clef n'a pas été trouvée dans votre navigateur. Il vous sera demandé de donner le mot de passe lors de l'ouverture de cette session.`,
    sessionEncryptedWrongKeyTooltip: `Cette session est chiffrée, et la clef qui est stockée dans votre navigateur n'est pas la bonne.`,
    newEncryptedSessionWarningTitle: `Cette session est chiffrée localement`,
    newEncryptedSessionWarningContent: (key: string) =>
      `Il est très important de sauvegarder l'URL complète de cette page (qui contient la clef de chiffrement). Le cas échéant, vous pouvez également sauvegarder la clef elle-même (${key}). Si vous perdez cette clef, il vous sera impossible de récupérer vos données.`,
    sessionEncryptionError: `Cette session est crytée, et vous ne semblez pas avoir la clef de chiffrement dans voter navigateur. Merci d'utiliser le lien complet qui vous a été donné lors de la création de cette session.`,
    passwordModalTitle: `Session chiffrée - Saisie du mot de passe`,
    passwordModelIncorrect: `Le mot de passe (ou clef de chiffrement) est incorrect.`,
  },
  Locking: {
    lockSuccessNotification:
      'La session a été correctement vérouillée. Aucun nouveau participant ne pourra y accéder.',
    unlockSuccessNotification: 'La session a été correctement dévérouillée.',
    lockButton: 'Vérouiller',
    unlockButton: 'Dévérouiller',
    lockDescription: `Vous êtes sur le point de vérouiller la session. Seuls les utilisateurs ayant déjà accédé à cette session (dont la liste s'affiche ci-dessous) pourront accéder à cette session une fois vérouillée.`,
    cancelButton: 'Annuler',
    sessionLockedTitle: 'Cette session est vérouillée.',
    sessionLockedDescription:
      'Demandez à votre modérateur de la dévérouiller pour que vous puissiez la rejoindre. Ensuite, rafraichissez la page.',
    sessionNonProTitle: `Cette session n'est accessible qu'aux utilisateurs Pro.`,
    sessionNonProDescription: `Cette session n'est ouverte qu'aux détenteurs d'un compte Retrospected Pro. Vous pouvez demander au modérateur ou au gérant de l'abonnement Pro de vous donner un accès.`,
  },
} as Translation;
