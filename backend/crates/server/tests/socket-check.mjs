import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(pathToFileURL(process.env.SOCKET_IO_CLIENT).href);
const { io } = require(process.env.SOCKET_IO_CLIENT);

const [baseA, baseB, cookie, sessionId] = process.argv.slice(2);
const options = { extraHeaders: { cookie }, transports: ['websocket'] };
const speaker = io(baseA, options);
const listener = io(baseB, options);

function opened(socket) {
  return new Promise((resolve, reject) => {
    socket.on('connect', resolve);
    socket.on('connect_error', (error) => reject(error));
  });
}

listener.on('retrospected/posts/receive/add', (data) => {
  if (data.content === 'across redis') {
    console.log('ok');
    speaker.close();
    listener.close();
    process.exit(0);
  }
});

function once(socket, event) {
  return new Promise((resolve) => socket.once(event, resolve));
}

await Promise.all([opened(speaker), opened(listener)]);
const joined = Promise.all([
  once(speaker, 'retrospected/posts/receive-all'),
  once(listener, 'retrospected/posts/receive-all'),
]);
const join = { payload: {}, sessionId, ack: 'join' };
speaker.emit('retrospected/session/join', join);
listener.emit('retrospected/session/join', join);
await joined;
speaker.emit('retrospected/posts/add/success', {
  payload: { content: 'across redis', column: 0 },
  sessionId,
  ack: 'post',
});
setTimeout(() => {
  console.error('timed out waiting for the remote post');
  process.exit(1);
}, 8000);
