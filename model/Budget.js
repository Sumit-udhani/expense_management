const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Budget = sequelize.define('Budget', {
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        month: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 12,
            },
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: true, // <-- allow null for overall budget
            references: {
                model: 'Categories', // make sure this matches your actual table name
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
    }, {
        timestamps: true,
    });

    return Budget;
};
