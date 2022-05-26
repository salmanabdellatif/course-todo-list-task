const http = require('http');
const app = require('./app');
require('dotenv').config();
// console.log(process.env.JWT_SECRET);

http
  .createServer(app)
  .listen(3000, () => console.log('Server started on port 3000'));
