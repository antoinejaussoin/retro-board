import { init } from './db/postgres';

async function go() {
  await init();
}

go();
