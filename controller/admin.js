const {User,Roles,Expense,Category,Tag} = require('../model')
exports.getAllUsers = async(req,res,next)=>{
    try {
        const users = await User.findAll({
            attributes:['id','name','email','isActive'],
            include:{model:Roles,attributes:['name']}
        })
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
}


exports.getAllExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findAll({
      attributes: ['id', 'title', 'amount', 'date', 'notes',  'userId', 'categoryId'],
      include: [
        {
          model: User,
          attributes: ['id', 'name'] 
        },
        {
          model: Category,
          attributes: ['id', 'name'] 
        },
        {
          model: Tag,
          attributes: ['id', 'name'],
          through: { attributes: [] } 
        }
      ]
    });

    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'error during fetching Expenses', err: error });
  }
};

  
exports.deleteUsers = async (req,res,next) =>{
    try {
        const users =  await User.findByPk(req.params.id)
        if (!users) {
            return res.status(404).json({ error: 'User  not found' }); 
        }
       await  users.destroy()
       res.status(200).json({message: 'User deleted successfully '})
    } catch (error) {
        res.status(500).json({message:'eror during Deleting User'})
    }
}