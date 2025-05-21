const express = require('express');
const cors = require('cors'); // ✅ include this
const bodyParser = require('body-parser');

const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const categoryRoutes = require('./routes/category');
const adminRoutes = require('./routes/admin');
const tagRoutes = require('./routes/tag');
const budgetRoutes = require('./routes/budget');

const app = express();


app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,               
}));

app.use(bodyParser.json());
app.use('/files', express.static('files'));

app.use('/auth', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/category', categoryRoutes);
app.use('/admin', adminRoutes);
app.use('/tag', tagRoutes);
app.use('/budget', budgetRoutes);

const { sequelize } = require("./model");

sequelize.sync({ alter: true })
  .then(() => {
    console.log('connected');
    app.listen(8085);
  })
  .catch(err => {
    console.log(err);
  });
