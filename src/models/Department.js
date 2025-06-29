const { DataTypes } = require('sequelize');
const sequelize = require('./../modules/sequelize/db');
const User = require('./User');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  name_en: {
    type: DataTypes.STRING(255),
    unique: true,
  },
  parent_id: {
    type: DataTypes.INTEGER.UNSIGNED
  },
}, {
  tableName: 'bree7e_cris_departments'
});

const belongsTo = [//{
    //model: Department,
    //foreignKey: 'parent_id'
  //},
];

Department.belongsToMany(User, { 
  through: 'bree7e_cris_authors_departments_positions',
  foreignKey: 'department_id', // ключ для текущей модели
  otherKey: 'rb_author_id',     // ключ для связанной модели
});

for(const bTo of belongsTo) {
  Department.belongsTo(bTo.model, {
    foreignKey: bTo.foreignKey
  });
}

module.exports = Department;