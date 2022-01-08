import { Column } from 'typeorm';
import {
  SessionOptions as JsonSessionOptions,
  defaultOptions,
  SessionOptions,
} from 'common';

export default class SessionOptionsEntity {
  @Column({ nullable: true, type: 'numeric' })
  public maxUpVotes: number | null;
  @Column({ nullable: true, type: 'numeric' })
  public maxDownVotes: number | null;
  @Column({ nullable: true, type: 'numeric' })
  public maxPosts: number | null;
  @Column({ default: true })
  public allowActions: boolean;
  @Column({ default: false })
  public allowSelfVoting: boolean;
  @Column({ default: false })
  public allowMultipleVotes: boolean;
  @Column({ default: false })
  public allowAuthorVisible: boolean;
  @Column({ default: true })
  public allowGiphy: boolean;
  @Column({ default: true })
  public allowGrouping: boolean;
  @Column({ default: true })
  public allowReordering: boolean;
  @Column({ default: false })
  public blurCards: boolean;
  @Column({ default: true })
  public newPostsFirst: boolean;

  toJson(): SessionOptions {
    return {
      ...this,
    };
  }

  constructor(options: Partial<JsonSessionOptions>) {
    const optionsWithDefault = getDefaultOptions(options);
    this.maxUpVotes = optionsWithDefault.maxUpVotes;
    this.maxDownVotes = optionsWithDefault.maxDownVotes;
    this.maxPosts = optionsWithDefault.maxPosts;
    this.allowAuthorVisible = optionsWithDefault.allowAuthorVisible;
    this.allowActions = optionsWithDefault.allowActions;
    this.allowSelfVoting = optionsWithDefault.allowSelfVoting;
    this.allowMultipleVotes = optionsWithDefault.allowMultipleVotes;
    this.allowGiphy = optionsWithDefault.allowGiphy;
    this.allowGrouping = optionsWithDefault.allowGrouping;
    this.allowReordering = optionsWithDefault.allowMultipleVotes;
    this.blurCards = optionsWithDefault.blurCards;
    this.newPostsFirst = optionsWithDefault.newPostsFirst;
  }
}

function getDefaultOptions(
  options: Partial<JsonSessionOptions>
): JsonSessionOptions {
  return {
    ...defaultOptions,
    ...options,
  };
}
