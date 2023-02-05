import { Buffer } from 'buffer'; //or 'buffer/', with trailing slash
import Process from 'process';
globalThis.process = Process;
globalThis.Buffer = Buffer;
