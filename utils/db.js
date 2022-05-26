const { Client } = require('pg');

const dbClient = async () => {
  const client = new Client({
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: 'password',
    database: 'postgres',
  });
  await client.connect();
  return client;
};
module.exports = dbClient;
