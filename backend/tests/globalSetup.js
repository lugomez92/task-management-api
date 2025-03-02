const { resetDatabase, seedTestDatabase } = require('./setupTests');

module.exports = async () => {
  await resetDatabase();
  await seedTestDatabase();
};