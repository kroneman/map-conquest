const path = require('path');
require('dotenv').config({
  path: path.resolve('.env')
});

const {
  DEBUG_GAME_CREATE_GAME_AS_SPECTATOR
} = process.env;

const PORT = process.env.PORT || 3000;
const Express = require('express');
const http = require('http');

const app = new Express();
const server = http.Server(app);
const io = require('socket.io')(server);

const Game = require('./game/game');
const logger = require('./logger');

app.use('/', Express.static('dist'));
io.on('connection', socket => new Game(io).connect(socket));

app.get('/settings', (req, res) => {
  res.send({
    createGameAsSpectator: DEBUG_GAME_CREATE_GAME_AS_SPECTATOR
      ? DEBUG_GAME_CREATE_GAME_AS_SPECTATOR === 'true' : false
  });
});

server.listen(PORT, (err) => {
  if (err) {
    logger.error(err);
    return;
  }

  logger.info(`Server listening on http://localhost:${PORT}`);
});
