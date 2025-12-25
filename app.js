const express = require('express');
const path = require('path');
const useRouter = require('./routes/user.routes');
const indexRouter = require('./routes/index.route');
const uploadRouter = require('./routes/upload.route');

const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cookieParser = require('cookie-parser');
 const connectToDB = require('./config/db');
 

 connectToDB()
 
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// serve static files from /public (put your favicon at public/logo.jpg)
app.use(express.static("public"));

app.use('/' , useRouter);
app.use('/' , indexRouter); 
app.use('/', uploadRouter);


 
app.listen(3000, () => {
    console.log(`Server is running on port  3000`);
})