const express = require('express')
const userRoutes = require('./routes/user')
const expenseRoutes = require('./routes/expense')
const categoryRoutes = require('./routes/category')
const adminRoutes = require('./routes/admin')
const tagRoutes = require('./routes/tag')
const budgetRoutes = require('./routes/budget')
 const app = express();
 const bodyParser = require('body-parser')

 app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE')
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization')
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
    next()
})

 app.use(bodyParser.json())
 app.use('/files', express.static('files'));

 app.use('/auth',userRoutes)
 app.use('/expense',expenseRoutes)
app.use('/category',categoryRoutes)
app.use('/admin',adminRoutes)
app.use('/tag',tagRoutes)
app.use('/budget',budgetRoutes)


 const { sequelize } = require("./model");
 sequelize.sync({alter:true})
 .then((result) => {
    console.log('connected')
    app.listen(8085)
 }).catch((err) => {
    console.log(err)
 });