const { verifyToken } = require('./jwt');
const SQL = require('sql-template-strings');

module.exports.resolveToken = db => async (req, res, next) => {
  const { token } = req.headers;
  const tokenResolve = verifyToken(token);
  if (!tokenResolve) return res.status(403).end();
  const {
    rows: [user],
  } = await db.query(SQL`select * from users where id = ${tokenResolve}`);
  user.password = '********';
  req.user = user;
  if (!req.user) return res.status(403).end();
  next();
};
