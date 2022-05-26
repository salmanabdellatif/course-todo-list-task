const SQL = require('sql-template-strings');
const { body, validationResult } = require('express-validator');

module.exports = (app, db) => {
  app.post(
    '/',
    [
      body('title').isLength({ min: 2, max: 20 }),
      body('content').isLength({ min: 8, max: 100 }),
    ],
    async (req, res) => {
      const { title, content } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        rows: [post],
      } = await db.query(
        SQL`INSERT INTO todos (title, content, token) VALUES(${title},${content},${req.headers.token}) RETURNING id;`
      );
      res.json({ mgs: 'add todo', id: post.id });
    }
  );

  app.put(
    '/:id',
    [
      body('title').isLength({ min: 2, max: 20 }),
      body('content').isLength({ min: 8, max: 100 }),
    ],
    async (req, res) => {
      const { title, content } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        rows: [post],
      } = await db.query(
        SQL`SELECT * FROM todos WHERE id = ${req.params.id} AND token = ${req.headers.token};`
      );
      if (!post) return res.status(404).json({ msg: 'todo not found' });

      if (title && content) {
        await db.query(
          SQL`UPDATE todos SET title = ${title}, content = ${content} WHERE id = ${req.params.id};`
        );
      }
      res.status(201).json({ msg: 'successfully edited' });
    }
  );

  app.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { token } = req.headers;
    const {
      rows: [post],
    } = await db.query(
      SQL`SELECT * FROM todos WHERE id = ${id} AND token = ${token};`
    );
    if (!post) return res.status(404).json({ msg: 'todo not found' });
    await db.query(`DELETE FROM todos WHERE id = ${id};`);
    res.status(201).json({ delete: 'done' });
  });

  app.get('/', async (req, res) => {
    const todoList = await db.query(
      SQL`SELECT * FROM todos WHERE token = ${req.headers.token};`
    );
    if (!todoList.rows[0]) {
      return res.status(404).json({ msg: 'you do not have any todos' });
    }
    res.json(todoList.rows);
  });

  app.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { token } = req.headers;
    const status = 'Complete';
    const {
      rows: [todo],
    } = await db.query(
      SQL`SELECT * FROM todos WHERE id = ${id} AND token = ${token};`
    );
    if (!todo) return res.status(404).json({ msg: 'id or token is wrong' });
    await db.query(SQL`UPDATE todos SET status = ${status} WHERE id = ${id};`);
    todo.status = status;
    res.json(todo);
  });

  return app;
};
