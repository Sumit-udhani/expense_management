const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Categories = sequelize.define('Categories', {
        name: {
            type: DataTypes.STRING,
            allowNull:false,
            
            
        }
      
       
    });

    return Categories;
};
