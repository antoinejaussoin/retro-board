import { io } from 'socket.io-client/build/index';

console.log('hello');

const newSocket = io({
  host: 'localhost',
  port: '8081',
});

newSocket.on('connect', () => {
  console.log('Connected');
});
