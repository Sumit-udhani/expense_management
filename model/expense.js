const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Expense = sequelize.define('Expense', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        notes: {
            type: DataTypes.TEXT,
        },
        paymentMode: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [['Cash', 'Credit', 'Debit', 'Bank Transfer']],
            },
        },
        paymentStatus: {
            type: DataTypes.ENUM('Paid', 'Pending', 'Failed'),
            allowNull: false,
            defaultValue: 'Pending',
        },
        attachment: {
            type: DataTypes.STRING,  // You can store file path or URL
            allowNull: true, // Attachment is optional
        },
    });

    return Expense;
};
