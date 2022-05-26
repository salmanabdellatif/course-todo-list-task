const express = require('express');
const dbClient = require('./utils/db.js');
const { resolveToken } = require('./utils/tokenMiddleware.js');

const users = require('./controllers/users.js');
const todo = require('./controllers/todo.js');

const app = express();
const { Router } = express;

app.use(express.json());

async function run() {
  const db = await dbClient();
  app.use('/users', users(new Router(), db));
  app.use('/todo', resolveToken(db), todo(new Router(), db));
}

run();

module.exports = app;
