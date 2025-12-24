const express = require('express');
const router = express.Router();
const { body , validationResult } = require('express-validator');
const user = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// "/user/register" 
router.get("/register" , (req,res) => {
    res.render('register'); 
})

router.post('/register' ,   
     body('email').trim().isEmail().isLength({min:10}) ,
     body('password').trim().isLength({min:5}),
     body('username').trim().isLength({min:3}) ,
    async ( req,res) =>{

        const errors = validationResult(req);
 
         if (!errors.isEmpty()){
            return res.status(400).json({
                    errors: errors.array(),
                 message: "Invalid registration data or thuis user already exists"
                 });
         }
            const { username , email , password } = req.body;  
            
            const hashedPassword = await bcrypt.hash(password, 10);

            const newuser = await user.create({
                username,
                email,
                password: hashedPassword,
            }); 

            res.redirect('/files');
})


router.get("/", (req,res) => {
    res.render('login');
})

router.post('/' , 
     body('username').trim().isLength({min:3}) ,
     body('password').trim().isLength({min:5})
     , async ( req,res) => {
  
    const errors = validationResult(req);
        if (!errors.isEmpty()){ 
              return res.status(400).json({
                     errors: errors.array(),    
                     message: "Invalid login data"
});
} 
   const { username , password } = req.body;

   const User = await user.findOne({
     username : username}); 

     if (!User){
        return res.status(400).json({ message: "Invalid username or password" });
     }
        const isMatch = await bcrypt.compare(password , User.password);
     
    if (!isMatch){
        return res.status(400).json({ message: "Invalid username or password" });
    }   
        
    const token = jwt.sign(
        {   userId: user._id , 
            email: user.email ,
            username: user.username
         }, 
        process.env.JWT_SECRET,
        { expiresIn: '1h'

    } );

    res.cookie('token', token );
    res.redirect('/files'); 
})
module.exports = router;