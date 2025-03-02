const { resetDatabase } = require('./setupTests');

module.exports = async () => {
  await resetDatabase();
};