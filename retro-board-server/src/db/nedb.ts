import Datastore from 'nedb';
import path from 'path';
import {
  Session,
  Post,
  ColumnDefinition,
  SessionOptions,
  defaultSession,
  Vote,
  User,
} from 'retro-board-common';
import { findIndex } from 'lodash';
import { Store } from '../types';

const dbFile = path.resolve(__dirname, '..', 'persist', 'db');

const create = (store: Datastore) => (
  id: string,
  options: SessionOptions,
  columns: ColumnDefinition[]
): Promise<void> =>
  new Promise((resolve, reject) => {
    store.findOne({ id }, (err, session) => {
      if (err) {
        reject(err);
      } else if (session) {
        reject();
      } else {
        store.update(
          { id },
          {
            id,
            name: '',
            posts: [],
            ...options,
            columns,
          } as Session,
          { upsert: true },
          err => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      }
    });
  });

const get = (store: Datastore) => (sessionId: string): Promise<Session> =>
  new Promise((resolve, reject) => {
    store.findOne({ id: sessionId }, (err, session) => {
      if (err) {
        reject(err);
      } else if (session) {
        resolve(session);
      } else {
        resolve({
          ...defaultSession,
          id: sessionId,
        });
      }
    });
  });

const saveSession = (store: Datastore) => (session: Session): Promise<void> =>
  new Promise((resolve, reject) => {
    store.update({ id: session.id }, session, { upsert: true }, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

const savePost = (store: Datastore) => (
  sessionId: string,
  post: Post
): Promise<void> =>
  new Promise((resolve, reject) => {
    store.findOne({ id: sessionId }, (err, session: Session) => {
      if (err) {
        reject(err);
      } else if (session) {
        const existingPostIndex = findIndex(
          session.posts,
          p => p.id === post.id
        );
        if (existingPostIndex > -1) {
          session.posts = [
            ...session.posts.slice(0, existingPostIndex),
            post,
            ...session.posts.slice(existingPostIndex + 1),
          ];
        } else {
          session.posts.push(post);
        }
        store.update({ id: session.id }, session, { upsert: true }, err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        const session: Session = {
          ...defaultSession,
          id: sessionId,
        };
        session.posts.push(post);
        store.update({ id: session.id }, session, { upsert: true }, err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }
    });
  });

const saveVote = (store: Datastore) => (
  sessionId: string,
  postId: string,
  vote: Vote
): Promise<void> => {
  return new Promise((resolve, reject) => {
    store.findOne({ id: sessionId }, (err, session: Session) => {
      if (err) {
        reject(err);
      } else if (session) {
        const post = session.posts.find(p => p.id === postId);

        if (post) {
          post.votes.push(vote);
          store.update({ id: session.id }, session, { upsert: true }, err => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      }
    });
  });
};

const deletePost = (store: Datastore) => (
  sessionId: string,
  postId: string
): Promise<void> =>
  new Promise((resolve, reject) => {
    store.findOne({ id: sessionId }, (err, session: Session) => {
      if (err) {
        reject(err);
      } else if (session) {
        session.posts = session.posts.filter(p => p.id !== postId);
        store.update({ id: session.id }, session, { upsert: true }, err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        reject(`No session found with this id: ${sessionId}`);
      }
    });
  });

const saveUser = (store: Datastore) => (user: User): Promise<void> =>
  new Promise((resolve, reject) => {
    store.update({ id: user.id }, user, { upsert: true }, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

export default function db() {
  const store = new Datastore({ filename: dbFile, autoload: true });
  return Promise.resolve<Store>({
    get: get(store),
    saveSession: saveSession(store),
    savePost: savePost(store),
    saveVote: saveVote(store),
    deletePost: deletePost(store),
    saveUser: saveUser(store),
    create: create(store),
  });
}
