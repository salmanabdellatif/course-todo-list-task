const bcrypt = require('bcryptjs');

module.exports.encryptPass = async password => {
  return await bcrypt.hash(password, 10);
};

module.exports.decryptPass = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (e) {
    return false;
  }
};
