const { Expense, User, Category, Tag } = require("../model");
const path = require('path');
const fs = require('fs');

module.exports = {
  async createExpense(req, res, next) {
    try {
      const { title, amount, date, notes, categoryId, tagId, paymentMode, paymentStatus } = req.body;
      const userId = req.userId;
      let attachment = null;

      // Handle file upload for attachment
      if (req.files && req.files.attachment) {
        const file = req.files.attachment;
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(__dirname, '../uploads', fileName);
        file.mv(filePath, (err) => {
          if (err) {
            return res.status(500).json({ message: 'File upload failed', err });
          }
        });
        attachment = filePath;
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
        attachment, // Save the attachment path
      });

      // Associate tags if provided
      if (tagId && tagId.length) {
        await expense.setTags(tagId);
      }

      res.status(201).json({ message: "Expense created successfully", expense });
    } catch (error) {
      res.status(500).json({ message: "Failed to create expense", err: error });
    }
  },

  async getExpense(req, res, next) {
    try {
      const userId = req.userId;
      const expense = await Expense.findByPk(req.params.id, {
        include: [User, Category, Tag],
      });
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      if (expense.userId !== userId) {
        return res.status(403).json({ message: "You are not authorized to see this expense" });
      }
      res.status(200).json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense" });
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

      // Handle file update if there's a new attachment
      let attachment = expense.attachment; // Keep the old attachment if no new file
      if (req.files && req.files.attachment) {
        const file = req.files.attachment;
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(__dirname, '../files', fileName);
        file.mv(filePath, (err) => {
          if (err) {
            return res.status(500).json({ message: 'File upload failed', err });
          }
        });

        // Delete old file if it exists (optional, depending on your storage strategy)
        if (attachment) {
          fs.unlinkSync(attachment);
        }

        attachment = filePath;
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
      if (expense.attachment) {
        fs.unlinkSync(expense.attachment);
      }

      await expense.destroy();
      res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error during deleting expense" });
    }
  },
};
