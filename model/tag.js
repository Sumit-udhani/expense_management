const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Tag = sequelize.define('Tag', {
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        }
    });

    return Tag;
};
