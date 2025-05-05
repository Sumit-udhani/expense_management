const { Expense, User, Category, Tag } = require("../model");
const path = require('path');
const fs = require('fs');

module.exports = {
  async createExpense(req, res, next) {
    try {
      const { title, amount, date, notes, categoryId, tagId, paymentMode, paymentStatus } = req.body;
      const userId = req.userId;
      let attachment = null;
      if (req.file) {
          attachment = req.file.path
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

      res.status(201).json({ message: "Expense created successfully", expense });
    } catch (error) {
      res.status(500).json({ message: "Failed to create expense", err: error });
    }
  },

  async getAllExpensesForUser(req, res, next) {
    try {
      const userId = req.userId;
      const expenses = await Expense.findAll({
        where: { userId },
        include: [Category, Tag], 
        order: [['createdAt', 'DESC']],
      });
      res.status(200).json(expenses);
    } catch (error) {
      console.error('Error fetching user expenses:', error);
      res.status(500).json({ error: 'Failed to fetch user expenses' });
    }
  },
  

  async expenseUpdate(req, res, next) {
    try {
      const userId = req.userId;
      const { title, amount, date, notes, categoryId, tagId, paymentMode, paymentStatus } = req.body;
      const expense = await Expense.findByPk(req.params.id);
      if (!expense) return res.status(404).json({ message: "Expense not found" });

      if (expense.userId !== userId) {
        return res.status(403).json({ message: "You are not authorized to update this expense" });
      }
      let attachment = expense.attachment;
      if (req.file) {
        // Delete old file
        if (attachment && fs.existsSync(attachment)) {
          fs.unlinkSync(attachment);
        }
        attachment = req.file.path;
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
        return res.status(403).json({ message: "You are not authorized to delete this expense" });
      }

      // Delete the file if it exists (optional)
      if (expense.attachment && fs.existsSync(expense.attachment)) {
        fs.unlinkSync(expense.attachment);
      }

      await expense.destroy();
      res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error during deleting expense" });
    }
  },
};  
