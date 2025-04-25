const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("expence_management", "root", "admin@123", {
  host: "localhost",
  dialect: "mysql",
});

const User = require("./user")(sequelize, DataTypes);
const Expense = require("./expense")(sequelize, DataTypes);
const Tag = require("./tag")(sequelize, DataTypes);
const Roles = require("./roles")(sequelize, DataTypes);
const Category = require("./categories")(sequelize, DataTypes);
const Budget = require("./Budget")(sequelize, DataTypes);


User.hasMany(Expense, { foreignKey: "userId" });
Expense.belongsTo(User, { foreignKey: "userId" });

User.belongsTo(Roles, { foreignKey: "roleId" });

Expense.belongsToMany(Tag, {
  through: "ExpenseTag",
  foreignKey: "expenseId",
});
Tag.belongsToMany(Expense, {
  through: "ExpenseTag",
  foreignKey: "tagId",
});

Category.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Category, { foreignKey: "userId" });

Category.hasMany(Expense, { foreignKey: "categoryId" });
Expense.belongsTo(Category, { foreignKey: "categoryId" });

Tag.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Tag, { foreignKey: "userId" });

User.hasMany(Budget, { foreignKey: "userId" });
Budget.belongsTo(User, { foreignKey: "userId" });

Category.hasMany(Budget, { foreignKey: "categoryId" });
Budget.belongsTo(Category, { foreignKey: "categoryId" });

sequelize
  .sync()
  .then()
  .catch((error) => console.log("Error syncing database:", error));

module.exports = {
  sequelize,
  User,
  Expense,
  Tag,
  Roles,
  Category,
  Budget,
};
