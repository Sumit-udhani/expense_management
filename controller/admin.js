const { User, Roles, Expense, Category, Tag } = require("../model");
const { Op } = require("sequelize");

exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const sortColumn = req.query.sortColumn || "name";
    const sortOrder = req.query.sortOrder?.toUpperCase() === "ASC" ? "ASC" : "DESC";
    const search = req.query.search || "";
    const limit = 5;
    const offset = (page - 1) * limit;

    
    const sortMapping = {
      name: ['name'],
      email: ['email'],
      status: ['isActive'],         
      role: [Roles, 'name'],        
    };

    const order = [];

    if (sortMapping[sortColumn]) {
      const column = sortMapping[sortColumn];
      if (Array.isArray(column)) {
        order.push(column.concat(sortOrder));
      } else {
        order.push([column, sortOrder]);
      }
    } else {
      
      order.push(['name', sortOrder]);
    }

    const { count, rows } = await User.findAndCountAll({
      where: {
        name: {
          [Op.like]: `%${search}%`,
        },
      },
      include: {
        model: Roles,
        attributes: ["name"],
      },
      order,
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);
    res.status(200).json({
      currentPage: page,
      totalPages,
      totalUsers: count,
      users: rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};



exports.getAllExpense = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    const { count, rows } = await Expense.findAndCountAll({
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
      offset,
      limit,
    });
    const totalPages = Math.ceil(count / limit);
    res.status(200).json({
      currentPage: page,
        totalPages,
        totalExpenses: count,
        data: rows,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "error during fetching Expenses", err: error });
  }
};

exports.getExpensesByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const searchTerm = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    const sortColumnMap = {
      title: ["title"],
      amount: ["amount"],
      category: [Category, "name"], 
      date: ["date"],
     
    };
    const sortParam = req.query.sortColumn || "createdAt";
    const sortOrder = req.query.sortOrder?.toUpperCase() === "ASC" ? "ASC" : "DESC";
    const sortColumn = sortColumnMap[sortParam] || ["title"];
    const { count, rows } = await Expense.findAndCountAll({
      where: {
        userId:id,
        title: {
          [Op.like]: `%${searchTerm}%`,
        },
      },
      include: [Category, Tag],
      order: [[...sortColumn, sortOrder]],
      offset,
      limit,
    });
    const totalPages = Math.ceil(count / limit);
    res.status(200).json({
      currentPage: page,
      totalPages,
      totalExpenses: count,
      data: rows,
    });
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
