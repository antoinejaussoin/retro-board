export interface Session {
  id: string;
  name: string;
  posts: Post[];
}

export interface LegacySession {
  id: string;
  name: string;
  posts: LegacyPost[];
}

export interface Post {
  id: string;
  postType: PostType;
  content: string;
  user: User;
  likes: User[];
  dislikes: User[];
}

export interface LegacyPost {
  id: string;
  postType: PostType;
  content: string;
  user: string;
  likes: string[];
  dislikes: string[];
}

export interface User {
  id: string;
  name: string;
}

export enum PostType {
  Well = 'well',
  NotWell = 'notWell',
  Ideas = 'ideas',
}
