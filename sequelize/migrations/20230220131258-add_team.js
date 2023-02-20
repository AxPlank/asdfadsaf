'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('team', {
      team_id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      team: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: "team"
      },
      league: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      pl: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      win: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      draw: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      lose: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      gf: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      ga: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      gd: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      pts: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('team');
  }
};
