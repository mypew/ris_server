const { DataTypes } = require('sequelize');
const sequelize = require('./../modules/sequelize/db');
const Department = require('./Department');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
  },
  middlename: {
    type: DataTypes.STRING(255),
  },
  surname: {
    type: DataTypes.STRING(255),
  },
  office: {
    type: DataTypes.STRING(255),
  },
}, {
  tableName: 'users'
});

const belongsTo = [//{
    //model: Model,
    //foreignKey: 'model_id'
  //},
];

//User.associate = function(Department) {
  //User.belongsToMany(Department, { 
    //through: 'bree7e_cris_authors_departments_positions',
    //foreignKey: 'department_id', // ключ для текущей модели
    //otherKey: 'rb_author_id',     // ключ для связанной модели
  //});
//};

for(const bTo of belongsTo) {
  User.belongsTo(bTo.model, {
    foreignKey: bTo.foreignKey
  });
}

module.exports = User;