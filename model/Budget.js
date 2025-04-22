const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Budget = sequelize.define('Budget', {
        amount: {
            type: DataTypes.DECIMAL(10,2),
            allowNull:false,
            
            
        },
        month:{
            type:DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 12,
            },
        },
        year:{
            type:DataTypes.INTEGER,
            allowNull:false
            
        }
       
       
    },{timestamps:true});

    return Budget;
};
