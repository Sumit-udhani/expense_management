const {Category} = require('../model')
const { Op } = require('sequelize');

module.exports = {
    async createCategory (req,res,next) {
        try {
            const {name} = req.body;
            const userId  = req.userId
            const category = await Category.create({
                name,
               
                userId
            })
            res.status(201).json({ message: 'Category created', category ,userId});
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Failed to create category', error });
        }
    },
    async getAll(req, res) {
      try {
        const userId = req.userId;
        const categories = await Category.findAll({
          where: {
            [Op.or]: [{ userId }, { userId: null }], // includes global (null) and user-specific
          },
        });
  
        res.status(200).json(categories);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch categories', error });
      }
    },
    async deleteCategory(req, res) {
        try {
          const category = await Category.findByPk(req.params.id);
          if (!category) {
            return res.status(404).json({ message: 'Category not found' });
          }
    
          await category.destroy();
          res.status(200).json({ message: 'Category deleted' });
        } catch (error) {
          res.status(500).json({ message: 'Failed to delete category', error });
        }
      }
}