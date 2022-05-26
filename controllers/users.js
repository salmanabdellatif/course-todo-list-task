const { resolveToken } = require('../utils/tokenMiddleware.js');
const { getSessionToken } = require('../utils/jwt');
const { encryptPass, decryptPass } = require('../utils/pEncryption.js');
const { body, check, validationResult } = require('express-validator');
const SQL = require('sql-template-strings');

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
      } = await db.query(SQL`SELECT * FROM users WHERE username = ${username}`);
      if (checkUser) {
        return res.status(500).json({ msg: 'try another username' });
      }

      const hash = await encryptPass(password);
      const {
        rows: [user],
      } = await db.query(
        SQL`INSERT INTO users (name ,username, password, birth) VALUES (${name}, ${username}, ${hash}, ${birth}) RETURNING id;`
      );
      const token = getSessionToken({ id: user.id });
      res.json({ id: user.id, token });
    }
  );

  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const {
      rows: [user],
    } = await db.query(SQL`SELECT * from users where username =${username}`);
    if (!user)
      return res.status(403).json({ error: { msg: 'user not found' } });
    const decrypt = await decryptPass(user.password);
    if (decrypt != password) {
      return res.status(403).json({ error: { msg: 'wrong password' } });
    }
    user.token = getSessionToken({ id: user.id });
    res.json(user);
  });

  app.get('/me', resolveToken(db), async (req, res) => {
    res.json(req.user);
  });
  return app;
};
