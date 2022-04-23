import { WsErrorType } from 'common';
import { Translation } from './types';
import { plural } from './utils';
export default {
  Header: {
    subtitle: "Un bon moyen de s'exprimer de façon Agile",
    logout: 'Déconnexion',
    leave: 'Sortir',
    summaryMode: 'Mode Résumé',
    account: 'Mon compte',
    adminPanel: 'Gestion des utilisateurs',
  },
  LanguagePicker: {
    header: 'Changez de langue',
  },
  Main: {
    hint: "Vous pouvez inviter d'autres participants en leur envoyant l'URL de cette page",
  },
  Home: {
    welcome: (userName: string) => `Bienvenue, ${userName}`,
  },
  PreviousGame: {
    createdBy: 'Créé par',
    posts: plural('post'),
    participants: plural('participant'),
    votes: plural('vote'),
    actions: plural('action'),
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
    maxPosts: `Nb de posts max`,
    maxPostsHelp: `Nombre maximum de posts qu'un participant peut créer par session`,
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
    newPostsFirst: `Nouveaux posts en premier`,
    newPostsFirstHelp:
      'Les nouveaux posts sont ajoutés en haut de chaque colonne',
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
    error: (error: WsErrorType) => {
      switch (error) {
        case 'action_unauthorised':
          return `Vous n'avez pas la permission de performer cette action.`;
        case 'cannot_edit_group':
          return 'La modification de ce groupe à échoué.';
        case 'cannot_edit_post':
          return 'La modification de ce post à échoué';
        case 'cannot_get_session':
          return 'Impossible de charger les données de cette session.';
        case 'cannot_register_vote':
          return `Votre vote n'a pas été enregistré.`;
        case 'cannot_save_group':
          return `Le groupe que vous avez créé n'a pas pu être enregistré correctement.`;
        case 'cannot_save_post':
          return `Le post que vous avez créé n'a pas pu être enregistré correctement.`;
        case 'cannot_delete_group':
          return 'Le groupe ne peut être supprimé';
        case 'cannot_delete_post':
          return 'Le post ne peut être supprimé';
        case 'cannot_rename_session':
          return 'La session ne peut être renommée';
        case 'cannot_save_columns':
          return `Les colonnes n'ont pu être enregistrées`;
        case 'cannot_save_options':
          return `Les options n'ont pu être enregistrées`;
        default:
          return 'Une erreur inconnue est survenue';
      }
    },
    maxPostsReached: `Vous avez atteint le nombre de posts maximum prévu par le modérateur.`,
    iAmDone: "J'ai fini !",
    iAmNotDoneYet: "Je n'ai pas encore fini...",
    userIsReady: (user) => `${user} est prêt !`,
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
    joined: (users: string) => `${users} connecté.`,
    left: (users: string) => `${users} déconnecté.`,
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
    namePlaceholder: 'Votre nom, ou pseudonyme',
    buttonLabel: 'Se connecter',
    header: 'Se connecter',
    anonymousAuthHeader: 'Identification Anonyme',
    anonymousAuthDescription:
      'Ceci va créer un compte anonyme, certaines fonctionalitées ne seront pas disponibles.',
    authenticatingWith: 'Identification avec',
    or: 'ou',
  },
  SocialMediaLogin: {
    header: 'OAuth',
    info: 'Un service tiers de votre choix va vous permettre de vous authentifier. Aucun mot de passe ne sera stocké.',
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
    header: 'Mot de Passe',
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
    info: 'Vous avez oublié votre mot de passe ? Pas de problème, entrez votre email et vous recevrez un email en retour.',
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
          `Ajouter des addresses emails ci-dessous pour donner un accès Pro à vos collaborateurs (dans la limite de ${limit} collaborateurs). Appuyez sur Entrée après chaque email.`,
      },
    },
    trial: {
      header: `Votre Periode d'Essai`,
      yourTrialWillExpireIn: (date: string) =>
        `Votre période d'essai va se terminer dans ${date}.`,
      subscribe: `S'abonner`,
    },
    deleteAccount: {
      title: 'GDPR',
      warning:
        "Vous avez le droit à l'oubli. Cela étant dit, effacer vos données est définitif.",
      deleteData: 'Effacer mes données',
      modal: {
        confirm: {
          title: 'Êtes-vous absolument certain(e) ?',
          description: "Cette opération n'est pas réversible !",
          confirmation: 'Oui, je veux effaçer toutes mes données',
          cancellation: "J'ai changé d'avis !",
        },
        subheader: 'Choisir quoi effacer',
        deleteAccount:
          'Effacer votre compte ainsi que toutes les identités liées à votre email.',
        recommended: 'Recommandé',
        deleteSessions: {
          main: 'Effacer les sessions (les rétrospectives) que vous avez créées ?',
          selected:
            "Vos sessions, and toutes les données associées (incluant les posts et votes d'autres personnes) seront éffacées de manière permanente et irréversible.",
          unselected:
            'Vos sessions seront conservées, et leur auteur deviendra un auteur anonyme.',
        },
        deletePosts: {
          main: 'Effacer les posts que vous avez écris ?',
          selected:
            "Vos posts, dans n'importe quelle session, ainsi que les votes associés, seront effacés de manière permanente et irreversible.",
          unselected:
            'Vos posts seront conservés, mais leur auteur deviendra un compte anonyme.',
        },
        deleteVotes: {
          main: 'Effacer vos votes ?',
          selected: "Vos votes, dans n'importe quelle session, seront effacés.",
          unselected: 'Vos votes seront conservés, et deviendront anonymes.',
        },
        deleteAccountButton: 'SUPPRIMER VOTRE COMPTE',
        cancelButton: 'Annuler',
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
      description: `Votre abonnement illimité est basé sur le nom de domaine de votre email. Tout utilisateur dont l'email contient ce nom de domaine sera automatiquement un utilisateur Pro.`,
      invalidDomain: `Merci d'entrer un nom de domaine valide. Les noms de domaines d'emails gratuits ne sont pas valides.`,
    },
    subscribe: {
      title: 'Payer',
      description: `Vous serez redirigé vers notre partenaire Stripe. Aucune coordonnées bancaire n'est stockée par Retrospected.`,
      cannotRegisterWithAnon: `Vous devez être connecté avec un compte OAuth ou Classique (mot de passe) avant de continuer.`,
      checkout: 'Payer',
    },
  },
  SubscribeModal: {
    title: 'Abonnement Pro',
    header: 'Retrospected Pro',
    description: `Protégez les données de votre entreprise en vous abonnant à Retrospected Pro. Avec Retrospected Pro, bénéficiez des fonctionalités suivantes:`,
    features: {
      encryptedSession: {
        title: 'Session Cryptées',
        description:
          'Vos données sont cryptées localement, sur votre navigateur, les rendant impossible à déchiffrer sur le serveur.',
      },
      privateSessions: {
        title: 'Session Privées',
        description:
          'Assurez-vous que seules les personnes choisies puissent accéder à votre session.',
      },
      unlimitedPosts: {
        title: 'Posts illimités',
        description: 'Nombre de posts illimité avec Retrospected Pro.',
      },
    },
    subscribeButton: `S'abonner`,
    payButton: 'Selectionner',
    cancelButton: `Annuler`,
    startTrial: `Essai 30 jours`,
  },
  Products: {
    team: `Parfait pour une équipe, vous pouvez sélectioner jusqu'à 20 collègues qui recevront un compte Retrospected Pro.`,
    unlimited: `Si vous avez besoin de plus, l'abonnement "Pro Unlimited" vous donnera un nombre de compte Pro illimité`,
    'self-hosted':
      'Installez Retrospected sur vos serveurs. Gardez le contrôle total de vos données, et profitez des mise-à-jours illimitées.',
    users: (users: number) => `${users} utilisateurs`,
    unlimited_seats: 'Illimité',
    month: 'mois',
    year: 'an',
    wantToPayYearly:
      'Je souhaite payer annuellement, et obtenir un mois gratuit par an !',
  },
  Encryption: {
    createEncryptedSession: 'Session cryptée',
    sessionNotEncrypted: `Cette session n'est pas cryptée`,
    sessionEncryptedHaveKeyTooltip: `Cette session est chiffrée, et la clef est stockée dans votre navigateur. Vous pouvez ouvrir cette session sans avoir à en donner le mot de passe.`,
    sessionEncryptedNoKeyTooltip: `Cette session est chiffrée, et la clef n'a pas été trouvée dans votre navigateur. Il vous sera demandé de donner le mot de passe lors de l'ouverture de cette session.`,
    sessionEncryptedWrongKeyTooltip: `Cette session est chiffrée, et la clef qui est stockée dans votre navigateur n'est pas la bonne.`,
    newEncryptedSessionWarningTitle: `Cette session est chiffrée localement`,
    newEncryptedSessionWarningContent: (key: string) =>
      `Il est très important de sauvegarder l'URL complète de cette page (qui contient la clef de chiffrement). Le cas échéant, vous pouvez également sauvegarder la clef elle-même (${key}). Si vous perdez cette clef, il vous sera impossible de récupérer vos données.`,
    sessionEncryptionError: `Cette session est cryptée, et vous ne semblez pas avoir la clef de chiffrement dans votre navigateur. Merci d'utiliser le lien complet qui vous a été donné lors de la création de cette session.`,
    passwordModalTitle: `Session chiffrée - Saisie du mot de passe`,
    passwordModelIncorrect: `Le mot de passe (ou clef de chiffrement) est incorrect.`,
  },
  Private: {
    lockSuccessNotification:
      'La session a été correctement privatisée. Aucun nouveau participant ne pourra y accéder.',
    unlockSuccessNotification: 'La session a été correctement rendue publique.',
    lockButton: 'Rendre privée',
    unlockButton: 'Rendre publique',
    lockDescription: `Vous êtes sur le point de privatiser la session. Seuls les utilisateurs ayant déjà accédé à cette session (dont la liste s'affiche ci-dessous) pourront accéder à cette session une fois vérouillée.`,
    cancelButton: 'Annuler',
    sessionLockedTitle: 'Cette session est privée.',
    sessionLockedDescription:
      'Demandez à votre modérateur de la rendre publique pour que vous puissiez la rejoindre. Ensuite, rafraichissez la page.',
    sessionNonProTitle: `Cette session n'est accessible qu'aux utilisateurs Pro.`,
    sessionNonProDescription: `Cette session n'est ouverte qu'aux détenteurs d'un compte Retrospected Pro. Vous pouvez demander au modérateur ou au gérant de l'abonnement Pro de vous donner un accès.`,
    sessionIsPublic:
      'Cette session est publique, et accessible à tout le monde.',
    sessionIsPrivate: 'Cette session est privée, et vous y avez accès.',
    sessionIsPrivateNoAccess: `Cette session est privée, mais vous n'y avez pas accès.`,
  },
  TrialPrompt: {
    allowanceReachedTitle: 'Vous avez atteint la limite de posts gratuits',
    allowanceReachedDescription:
      'Inscrivez-vous à Retrospected Pro pour passer en illimité',
    nearEndAllowanceTitle: 'Vous approchez la limite de posts gratuits',
    nearEndAllowanceDescription: (quota) =>
      `Vous avez environ ${quota} posts restants.`,
    onTrialTitle: `Retrospected Pro - Période d'essai`,
    remainingTrialSentence: (remaining) =>
      `Vous avez ${remaining} restant sur votre période d'essai.`,
    trialEndedTitle: `Votre période d'essai Retrospected Pro est terminée`,
    trialEndedSentence: `Abonnez-vous aujourd'hui pour continuer à bénéficier des avantages de la version Pro.`,
    subscribeNow: `Je m'abonne`,
  },
  Chat: { writeAMessage: 'Écrivez un message ici...' },
} as Translation;
