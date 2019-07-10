console.log('☢️   Migrating NeDB to Postgres  ☢️');
import 'reflect-metadata';
import { find } from 'lodash';
import { Session, User, Post } from '../db/entities';
import { getDb } from '../db/postgres';
import { LegacySession as ISession } from 'retro-board-common';
import Datastore from 'nedb';
import path from 'path';
import md5 from 'md5';

const dbFile = path.resolve(__dirname, '../../..', 'db');

console.log('🖥  DB File: ', dbFile);

interface UserDictionary {
  [key: string]: User;
}

getDb(true)
  .then(async connection => {
    const sessionRepository = connection.getRepository(Session);
    const userRepository = connection.getRepository(User);
    const postRepository = connection.getRepository(Post);
    await connection.dropDatabase();
    await connection.synchronize();
    const users: UserDictionary = {};
    let counter = 0;

    const store = new Datastore({ filename: dbFile, autoload: true });
    store.find({}, async (err: any, sessions: ISession[]) => {
      console.log('Sessions; ', sessions.length);
      const l = sessions.length;
      for (let k = 0; k < l; k++) {
        await persistSession(sessions[k]);
        if (counter % 10 === 0) {
          console.log('✅  Completed: ', counter, 'out of', l);
        }
      }
    });

    async function getOrCreateUser(name: string) {
      const id = md5(name);
      if (users[id]) {
        return users[id];
      }
      const user = new User(id, name);
      await userRepository.save(user);
      users[id] = user;
      return user;
    }

    async function persistSession(session: ISession) {
      const dbSession = new Session(session.id, session.name || '');
      await sessionRepository.save(dbSession);
      for (let i = 0; i < session.posts.length; i++) {
        const post = session.posts[i];

        const author = await getOrCreateUser(post.user || '');
        const dbPost = new Post(
          post.id,
          dbSession,
          post.postType,
          post.content,
          author
        );
        dbPost.likes = [];
        dbPost.dislikes = [];

        for (let j = 0; j < post.likes.length; j++) {
          const like = post.likes[j] || 'unknown';
          let user = await getOrCreateUser(like);
          if (!find(dbPost.likes, u => u.name === like)) {
            dbPost.likes.push(user);
          }
        }
        for (let j = 0; j < post.dislikes.length; j++) {
          const dislike = post.dislikes[j] || 'unknown';
          let user = await getOrCreateUser(dislike);
          if (!find(dbPost.dislikes, u => u.name === dislike)) {
            dbPost.dislikes.push(user);
          }
        }
        await postRepository.save(dbPost);
      }
      counter++;
    }
  })
  .catch(error => console.log(error));
