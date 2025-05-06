const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define('Tags', {
      name: {
        type: DataTypes.STRING,
        unique: true,  
        allowNull: false
      }
    });

    return Tag;
};
