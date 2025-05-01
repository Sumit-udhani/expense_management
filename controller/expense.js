const {Expense,User,Category,Tag} = require('../model')
module.exports = {
  
       async createExpense  (req,res,next)  {
        try {
           const {title,amount,date,notes,categoryId,tagId} = req.body;
           const userId = req.userId; 
           const expense = await Expense.create({
               title,
               amount,
               date,
               notes,
               userId,
               categoryId,
                tagId

           })
           if (tagId && tagId.length) {
               await expense.setTags(tagId)
           }
           res.status(201).json({message: 'expense created',expense})
        } catch (error) {
            res.status(500).json({message:'Failed create expense',err:error})
       }
    
      
   },
   async getAllExpense (req,res,next){
    try {
        const expense = await Expense.findAll({
            include:[User,Category,Tag]
        })
        res.status(200).json(expense)
    } catch (error) {
        res.status(500).json({message:'error during fetching Expenses',err:error})
    }
   },
   async getExpense (req,res,next){
    try {
        const expense = await Expense.findByPk(req.params.id,{
            includes:[User,Category,Tag]
        })
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
          }
          res.status(200).json(expense)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch expense' });
    }
   },
   async expenseUpdate (req,res,next) {
    try {
        
        const{title,amount,date,notes,userId,categoryId,tagId} = req.body;
        const expense = await Expense.findByPk(req.params.id)
        if (!expense) return res.status(404).json({ message: "Expense not found" });
        await expense.update({ title, amount, date, notes, categoryId });
    
        if (tagId) {
          await expense.setTags(tagId);
        }
        res.status(200).json(expense)
    } catch (error) {
        res.status(500).json({ error: 'Failed to Update expense' })
    }
   },
   async expenseDelete (req,res,next){
    try {
        
        const expense = await Expense.findByPk(req.params.id)
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        await expense.destroy()
        res.status(200).json({message: 'Expense deleted successfully '})
    } catch (error) {
        res.status(500).json({message:'eror during Deleting Expenses'})
    }
   }
}