const { User, Roles, Expense, Category, Tag } = require("../model");
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "isActive"],
      include: { model: Roles, attributes: ["name"] },
    });
    res.status(200).json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};

exports.getAllExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
        {
          model: Category,
          attributes: ["id", "name"],
        },
        {
          model: Tag,
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });

    res.status(200).json(expense);
  } catch (error) {
    res
      .status(500)
      .json({ message: "error during fetching Expenses", err: error });
  }
};

exports.getExpensesByUserId = async (req, res) => {
  const { id } = req.params;
  try {
    const expenses = await Expense.findAll({
      where: { userId: id }, 

      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
        {
          model: Tag,
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching expenses for the user",
      error: error.message,
    });
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const userId = req.params.id;
  const { isActive } = req.body;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    user.isActive = isActive;
    await user.save();
    res.status(200).json({ message: "User status updated successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user status", error: error.message });
  }
};
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userData = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'isActive'], 
      include: [
        {
          model: Roles,
          attributes: ['name'], 
        },
      ],
    });

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

   
    const user = userData.toJSON(); 
    user.role = user.Roles?.name;
   

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching user details', error: error.message });
  }
};
