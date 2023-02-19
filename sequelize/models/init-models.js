var DataTypes = require("sequelize").DataTypes;
var _team = require("./team");

function initModels(sequelize) {
  var team = _team(sequelize, DataTypes);


  return {
    team,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
