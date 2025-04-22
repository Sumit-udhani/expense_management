const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        name: DataTypes.STRING,
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            // unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
       
    });

    return User;
};
