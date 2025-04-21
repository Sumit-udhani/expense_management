const {Sequelize} = require('sequelize');
const sequelize = new Sequelize('expence_management','root','admin@123',{
    host:'localhost',
    dialect:'mysql'
})
const User = require('./user')(sequelize);
const Expense = require('./expense')(sequelize);
const Tag = require('./tag')(sequelize);
User.hasMany(Expense, { foreignKey: 'userId' });
Expense.belongsTo(User, { foreignKey: 'userId' });

Expense.belongsToMany(Tag, { through: 'ExpenseTag', foreignKey: 'expenseId' });
Tag.belongsToMany(Expense, { through: 'ExpenseTag', foreignKey: 'tagId' });

sequelize.sync({ force: true }).then(() => {
    console.log('Database synced!');
}).catch((error) => {
    console.log('Error syncing database:', error);
});
module.exports = sequelize;