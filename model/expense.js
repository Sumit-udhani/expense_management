const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Expense = sequelize.define('Expense', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        notes: {
            type: DataTypes.TEXT
        }
    });

    return Expense;
};
