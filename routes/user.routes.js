const express = require('express');
const router = express.Router();
const { body , validationResult } = require('express-validator');
const user = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const File = require( '../models/file.model'); // ✅ REQUIRED
 

// "/register" 
router.get("/register" , (req,res) => {
    res.render('register'); 
})

router.post(
  '/register',
  [
    body('email').trim().isEmail().isLength({ min: 10 }),
    body('password').trim().isLength({ min: 6 }),   // use >=6 for security
    body('username').trim().isLength({ min: 3 })
  ],
  async (req, res) => {
   
    const message = "User or email Already exist"

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // adjust render/json depending on your front-end expectations
        return res.status(400).render('error', {message});
      }

      const { username, email, password } = req.body;

      // check duplicate user
      const existingUser = await user.findOne({ email });
      if (existingUser) {
        return res.status(400).render('error', {message});
      }

      // hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const newuser = await user.create({
        username,
        email,
        password: hashedPassword
      });

      // generate token
      const token = jwt.sign({ userId: newuser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

      // set cookie (httpOnly)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true in production (https)
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      // redirect to protected route
      return res.redirect('/home');
    } catch (err) {
      console.error(err);
      return res.status(500).render('register', { error: 'Server error' });
    }
  }
);


//login route
router.get("/", (req,res) => {
    res.render('login');
})

router.post(
  '/',
  body('username').trim().isLength({ min: 3 }),
  body('password').trim().isLength({ min: 5 }),
  async (req, res) => {

   const message = "Invalid username or password";

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.render('error', { message  })
    }

    const { username, password } = req.body

    // ✅ find user
    const userDoc = await user.findOne({ username })
    if (!userDoc) {
      return res.status(400).render('error', { message: "Invalid username or password" })
    }

    // ✅ compare password
    const isMatch = await bcrypt.compare(password, userDoc.password)
    if (!isMatch) {
      return res.status(400).render('error', { message: "Invalid username or password" })
    }

    // ✅ CREATE JWT (IMPORTANT FIX)
    const token = jwt.sign(
      {
        userId: userDoc._id,           // 👈 MUST be `id`
        email: userDoc.email,
        username: userDoc.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    )

    // ✅ SECURE COOKIE
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    })

    res.redirect('/home')
  }
)


router.get('/profile', async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).render('error', { message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ FIX HERE
    const userDoc = await user
      .findById(decoded.userId)
      .select('username email createdAt');

    const userData = await user
      .findById(decoded.userId);

    const files = userData?.urls || [];

    res.render('profile', { user: userDoc, files });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Server Error' });
  }
});


router.get('/logout', (req, res) => {
  res.clearCookie('token')
  res.redirect('/')
});

 
 
module.exports = router;