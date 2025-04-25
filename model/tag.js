const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define('Tags', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      indexes: [
        {
          unique: true,
          fields: ['name']
        }
      ]
    });
  
    return Tag;
};
