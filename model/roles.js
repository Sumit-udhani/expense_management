const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Roles = sequelize.define('Roles', {
        name: {
            type: DataTypes.STRING,
            allowNull:false,
            // unique:true
            
        },
       
       
    });

    return Roles;
};
