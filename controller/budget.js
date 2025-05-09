const {Budget,Category,Expense} = require('../model')
const { Op } = require("sequelize");
const { fn, col, literal } = require('sequelize');

exports.setMonthlyBudget = async (req, res) => {
  try {
    const { amount, month, year, categoryId } = req.body;
    const userId = req.userId;

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
    console.error(error);
    res.status(500).json({ error: 'Failed to save budget', error });
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
  
      const expenses = await Expense.findAll({
        where: {
          userId,
          date: {
            [Op.gte]: start,
            [Op.lt]: end,
          },
        },
        include: [{ model: Category, attributes: ['name'] }],
        attributes: [
          'categoryId',
          [fn('SUM', col('amount')), 'total'],
        ],
        group: ['categoryId', 'Category.id'],
      });
  
      const result = expenses.map((e) => ({
        category: e.Category?.name || 'Uncategorized',
        total: parseFloat(e.dataValues.total),
      }));
  
      res.json(result);
    } catch (error) {
      console.error('Error getting category distribution:', error);
      res.status(500).json({ error: 'Failed to fetch category-wise expenses' });
    }
  };