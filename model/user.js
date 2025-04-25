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
        IsEmailVerifed:{
            type:DataTypes.BOOLEAN,
            default:false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false, 
          },
        otp: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          otpExpiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
          },
       
    });

    return User;
};
