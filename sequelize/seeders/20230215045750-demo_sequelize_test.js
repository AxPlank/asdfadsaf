'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('sequelize_tests', [{
      first_attri: "LONDON",
      second_attri: "IS RED",
      third_attri: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('sequelize_tests', null, {});
  }
};
