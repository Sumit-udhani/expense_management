const {Budget,Category,Expense} = require('../model')
const { Op } = require("sequelize");
const { fn, col, literal } = require('sequelize');

exports.setMonthlyBudget = async (req, res) => {
  try {
    const { amount, month, year, categoryId } = req.body;
    const userId = req.userId;

    const isCategoryBudget = !!categoryId;


    if (isCategoryBudget) {
      
      const overallBudget = await Budget.findOne({
        where: { userId, month, year, categoryId: null },
      });

      if (!overallBudget) {
        return res.status(400).json({
          error: "Set an overall budget first before setting category budgets.",
        });
      }

      const totalOverallBudget = parseFloat(overallBudget.amount);

   
      const otherBudgets = await Budget.findAll({
        where: {
          userId,
          month,
          year,
          categoryId: { [Op.ne]: null, [Op.ne]: categoryId },
        },
      });

      const otherTotal = otherBudgets.reduce(
        (sum, b) => sum + parseFloat(b.amount),
        0
      );

    
      const remaining = totalOverallBudget - otherTotal;

      if (parseFloat(amount) > remaining) {
        return res.status(400).json({
          error: `Not enough budget available. You can assign up to ${remaining} for this category.`,
        });
      }
    }


    const whereClause = {
      userId,
      month,
      year,
      categoryId: categoryId || null,
    };

    const [budget, created] = await Budget.findOrCreate({
      where: whereClause,
      defaults: { amount },
    });

    if (!created) {
      budget.amount = amount;
      await budget.save();
    }

    res.status(201).json({ message: 'Budget Saved', budget });
  } catch (error) {
    console.error("Set Monthly Budget Error:", error);
    res.status(500).json({ error: 'Failed to save budget' });
  }
};

exports.getMonthlyBudgetStatus = async (req, res) => {
  try {
    const userId = req.userId;


    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextMonthYear = month === 12 ? year + 1 : year;

    const budgets = await Budget.findAll({
      where: { userId, month, year },
      include: [Category],
    });

    const expenses = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: new Date(`${year}-${month}-01`),
          [Op.lt]: new Date(`${nextMonthYear}-${nextMonth}-01`),
        },
      },
    });

    const totalSpent = expenses.reduce((acc, exp) => acc + parseFloat(exp.amount), 0);

    const overallBudget = budgets.find((b) => b.categoryId === null);
    const totalBudget = parseFloat(overallBudget?.amount || 0);

    const categoryBudgets = budgets.filter((b) => b.categoryId !== null);
    const remaining = totalBudget - totalSpent;

    res.status(200).json({
      overallBudget,
      budgets: categoryBudgets,
      totalSpent,
      remaining,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get monthly status', err });
  }
};

exports.getMonthlyTotals = async (req, res) => {
  const userId = req.userId;
  const year = parseInt(req.query.year);

  try {
    const expenses = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: new Date(`${year}-01-01`),
          [Op.lt]: new Date(`${year + 1}-01-01`),
        },
      },
    });

    const monthlyTotals = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString('default', { month: 'long' }),
      total: 0,
    }));

    expenses.forEach((exp) => {
      const expMonth = new Date(exp.date).getMonth();
      monthlyTotals[expMonth].total += parseFloat(exp.amount);
    });

    res.json(monthlyTotals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get monthly totals' });
  }
};

exports.getCategoryDistribution = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const start = new Date(`${year}-${month}-01`);
    const end = new Date(`${year}-${month + 1}-01`);

  
    const allCategories = await Category.findAll();


    const expenses = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: start,
          [Op.lt]: end,
        },
      },
      attributes: [
        'categoryId',
        [fn('SUM', col('amount')), 'total'],
      ],
      group: ['categoryId'],
      raw: true,
    });

   
    const budgets = await Budget.findAll({
      where: {
        userId,
        month,
        year,
        categoryId: { [Op.ne]: null },
      },
      raw: true,
    });

    
    const result = allCategories.map((category) => {
      const catId = category.id;
      const catName = category.name;

      const expenseEntry = expenses.find((e) => e.categoryId === catId);
      const budgetEntry = budgets.find((b) => b.categoryId === catId);

      return {
        categoryId: catId,
        category: catName,
        total: parseFloat(expenseEntry?.total || 0),
        budget: parseFloat(budgetEntry?.amount || 0) || null,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error getting category distribution:", error);
    res.status(500).json({ error: "Failed to fetch category-wise expenses" });
  }
};