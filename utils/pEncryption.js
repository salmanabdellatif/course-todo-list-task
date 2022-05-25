const bcrypt = require('bcryptjs');

async function encryptPass(password) {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      return hash;
    });
  });
}

async function decryptPass(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (e) {
    return false;
  }
}

module.exports = decryptPass();
module.exports = encryptPass();
