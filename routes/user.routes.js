const express = require('express');
const router = express.Router();
const { body , validationResult } = require('express-validator');
const User = require('../models/user.model');
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
                 message: "Invalid registration data"
                 });
         }
            const { username , email , password } = req.body;  
            
            const hashedPassword = await bcrypt.hash(password, 10);

            const newuser = await new User({
                username,
                email,
                password: hashedPassword,
            }); 

            res.json(newuser)
})


router.get("/login", (req,res) => {
    res.render('login');
})

router.post('/login' , 
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

   const user = await User.findOne({
     username : username});

     if (!user){
        return res.status(400).json({ message: "Invalid username or password" });
     }
        const isMatch = await bcrypt.compare(password , user.password);
     
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

    res.json({ token: token });
     });
module.exports = router;