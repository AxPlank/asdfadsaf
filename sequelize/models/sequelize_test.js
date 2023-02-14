'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sequelize_test extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  sequelize_test.init({
    first_attri: DataTypes.STRING,
    second_attri: DataTypes.STRING,
    third_attri: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'sequelize_test',
  });
  return sequelize_test;
};