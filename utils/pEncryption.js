const Cryptr = require('cryptr');
require('dotenv').config();
const cryptr = new Cryptr(process.env.CRYPTR_SECRET);

module.exports.encryptPass = async password => {
  return await cryptr.encrypt(password);
};

module.exports.decryptPass = async hash => {
  return await cryptr.encrypt(hash);
};
