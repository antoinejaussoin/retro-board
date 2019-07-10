import Datastore from 'nedb';
import path from 'path';
import { Session } from 'retro-board-common';
import { Store } from '../types';

const dbFile = path.resolve(__dirname, '..', 'persist', 'db');

const get = (store: Datastore) => (sessionId: string) =>
  new Promise((resolve, reject) => {
    store.findOne({ id: sessionId }, (err, session) => {
      if (err) {
        reject(err);
      } else if (session) {
        resolve(session);
      } else {
        resolve({
          id: sessionId,
          name: null,
          posts: [],
        });
      }
    });
  });

const set = (store: Datastore) => (session: Session) =>
  new Promise((resolve, reject) => {
    store.update({ id: session.id }, session, { upsert: true }, err => {
      if (err) {
        reject(err);
      } else {
        resolve(session);
      }
    });
  });

export default function db() {
  const store = new Datastore({ filename: dbFile, autoload: true });
  return Promise.resolve<Store>({
    get: get(store),
    set: set(store),
  });
}
