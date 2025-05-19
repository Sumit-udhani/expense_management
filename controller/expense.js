const { Expense, User, Category, Tag } = require("../model");
const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");
module.exports = {
  async createExpense(req, res, next) {
    try {
      const {
        title,
        amount,
        date,
        notes,
        categoryId,
        tagId,
        paymentMode,
        paymentStatus,
      } = req.body;
      const userId = req.userId;
      let attachment = null;
      if (req.file) {
        attachment = `files/${req.file.filename}`;

      }

      const expense = await Expense.create({
        title,
        amount,
        date,
        notes,
        userId,
        categoryId,
        tagId,
        paymentMode,
        paymentStatus,
        attachment,
      });

      if (tagId && tagId.length) {
        await expense.setTags(tagId);
      }

      res
        .status(201)
        .json({ message: "Expense created successfully", expense });
    } catch (error) {
      res.status(500).json({ message: "Failed to create expense", err: error });
    }
  },
  
  async getAllExpensesForUser(req, res, next) {
    try {
      const userId = req.userId;
      const searchTerm = req.query.search || "";
      const page = parseInt(req.query.page) || 1;
      const limit = 5;
      const offset = (page - 1) * limit;
      const sortColumnMap = {
        title: ["title"],
        amount: ["amount"],
        date: ["date"],
        paymentStatus: ["paymentStatus"],
        paymentMode: ["paymentMode"],
        category: [Category, "name"], 
        createdAt: ["createdAt"],
      };
  
      const sortParam = req.query.sortColumn || "createdAt";
      const sortOrder = req.query.sortOrder?.toUpperCase() === "ASC" ? "ASC" : "DESC";
  
      const sortColumn = sortColumnMap[sortParam] || ["createdAt"];
  
     
      const { count, rows } = await Expense.findAndCountAll({ 
        where: {
          userId,
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
      console.error("Error fetching user expenses:", error);
      res.status(500).json({ error: "Failed to fetch user expenses" });
    }
  },
  

  async expenseUpdate(req, res,) {
    try {
      const userId = req.userId;
      const {
        title,
        amount,
        date,
        notes,
        categoryId,
        tagId,
        paymentMode,
        paymentStatus,
      } = req.body;
      const expense = await Expense.findByPk(req.params.id);
      if (!expense)
        return res.status(404).json({ message: "Expense not found" });

      if (expense.userId !== userId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to update this expense" });
      }
      let attachment = expense.attachment;
      if (req.file) {
       
        if (attachment && fs.existsSync(attachment)) {
          fs.unlinkSync(attachment);
        }
        attachment = `files/${req.file.filename}`;
      }

      await expense.update({
        title,
        amount,
        date,
        notes,
        categoryId,
        paymentMode,
        paymentStatus,
        attachment,
      });

      if (tagId) {
        await expense.setTags(tagId);
      }

      res.status(200).json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to update expense" });
    }
  },

  async expenseDelete(req, res, next) {
    try {
      const userId = req.userId;
      const expense = await Expense.findByPk(req.params.id);
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      if (expense.userId !== userId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this expense" });
      }

      if (req.file) {
        if (expense.attachment && fs.existsSync(expense.attachment)) {
          fs.unlinkSync(expense.attachment);
        }
      }

      await expense.destroy();
      res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error during deleting expense" });
    }
  },
};
