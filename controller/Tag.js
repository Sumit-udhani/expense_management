const {Tag} = require('../model')
exports.createTag  =async(req, res) => {
    try {
      const { name } = req.body;
      const userId = req.userId
      if (!name) return res.status(400).json({ message: 'Tag name is required' });

      const [tag, created] = await Tag.findOrCreate({ where: { name },defaults: { userId }, });
      res.status(created ? 201 : 200).json(tag);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create tag', error });
    }
  }