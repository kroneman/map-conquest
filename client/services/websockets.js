import io from 'socket.io-client';

const SOCKET_ENDPOINT = window.location.origin || 'http://localhost:3000';

export default () => io.connect(SOCKET_ENDPOINT);
