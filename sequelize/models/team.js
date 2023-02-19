const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('team', {
    team_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    team: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "team"
    },
    league: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    pl: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    win: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    draw: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lose: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gf: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ga: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gd: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pts: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'team',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "team_id" },
        ]
      },
      {
        name: "team",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "team" },
        ]
      },
    ]
  });
};
