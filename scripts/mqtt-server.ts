import * as net from 'net';
import aedesBuilder from 'aedes';

const aedes = aedesBuilder();
const server = net.createServer(aedes.handle);

export default server;
