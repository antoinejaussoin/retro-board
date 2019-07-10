import { Translation } from './types';
export default {
  Header: {
    subtitle: 'A good way of ranting in an Agile way',
    logout: 'ログアウト',
    leave: '退室',
    summaryMode: '要約モード',
  },
  LanguagePicker: {
    header: '言語を選択',
  },
  Main: {
    hint: 'URLを共有すれば新たな参加者を本セッションに招待できます',
  },
  Post: {
    vote: '投票',
    votes: '表決',
    deleteButton: '削除',
    noContent: '(項目が空です)',
  },
  PostBoard: {
    notWellQuestion: '改善できること',
    wellQuestion: '良かったこと',
    ideasQuestion: '共有したいアイディア',
  },
  Clients: {
    header: '現在の参加者',
  },
  Join: {
    welcome: 'Retrospectedへようこそ',
    standardTab: {
      header: '作成',
      text: 'セッションを作成してレトロスペクティブをはじめる',
      button: '新しいセッションを作成する',
    },
    optionsTab: {
      header: '設定',
      input: '名前',
      button: 'カスタムセッショを作成する',
    },
    previousTab: {
      header: '以前のセッション',
      rejoinButton: '再開',
    },
  },
  Login: {
    namePlaceholder: '名前を入力',
    buttonLabel: 'スタート',
  },
  SummaryBoard: {
    noPosts: '表示する項目がありません',
  },
  SessionName: {
    defaultSessionName: '新しいレトロスペクティブ',
  },
  Invite: {
    inviteButton: '招待',
    dialog: {
      title: 'レトロスペクティブに招待する',
      text: '下記のURLを共有して本セッションに招待できます',
      copyButton: 'URLをクリップボードにコピー',
    },
  },
  Generic: {
    ok: 'OK',
    cancel: 'Cancel',
  },
} as Translation;
