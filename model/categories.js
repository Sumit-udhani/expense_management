const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Categories = sequelize.define('Categories', {
        name: {
            type: DataTypes.STRING,
            allowNull:false,
            
            
        },
        isGlobal: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
       
       
    });

    return Categories;
};
