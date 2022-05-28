const { resolveToken } = require('../utils/tokenMiddleware.js');
const { getSessionToken } = require('../utils/jwt');
const { encryptPass, decryptPass } = require('../utils/pEncryption.js');
const { body, validationResult } = require('express-validator');
const SQL = require('sql-template-strings');
const { query } = require('express');

module.exports = (app, db) => {
  app.post(
    '/register',
    [
      body('name').isLength({ min: 2, max: 30 }),
      body('username').isLength({ min: 2, max: 30 }),
      body('password').isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }),
      body('birth').isDate(),
    ],
    async (req, res) => {
      const { username, password, name, birth } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        rows: [checkUser],
      } = await db.query(
        SQL`SELECT * FROM users WHERE username = ${username};`
      );
      if (checkUser) {
        return res.status(401).json({ msg: 'try another username' });
      }

      const hash = await encryptPass(password);
      const {
        rows: [user],
      } = await db.query(
        SQL`INSERT INTO users (name ,username, password, birth) VALUES (${name}, ${username}, ${hash}, ${birth}) RETURNING id;`
      );
      const token = getSessionToken(user.id);
      res.json({ id: user.id, token });
    }
  );

  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const {
      rows: [user],
    } = await db.query(SQL`SELECT * from users WHERE username =${username}`);
    if (!user)
      return res.status(403).json({ error: { msg: 'user not found' } });
    const decrypt = await decryptPass(user.password);
    if (decrypt != password) {
      return res.status(403).json({ error: { msg: 'wrong password' } });
    }
    user.token = getSessionToken(user.id);
    user.password = '*******';
    const todos = await db.query(
      SQL`SELECT * FROM todos WHERE token = ${user.token};`
    );
    res.json({ user: user, todos: todos.rows });
  });

  app.get('/me', resolveToken(db), async (req, res) => {
    res.json(req.user);
  });
  return app;
};
