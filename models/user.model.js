const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    minlength: 3
  },

  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },

  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6
  },

  // 👇 FILES STORED HERE
  urls: [
    {
      fileUrl: { type: String, required: true },
      fileName: { type: String, required: true },
      fileType: { type: String },          // ✅ ADD THIS
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
})

const user = mongoose.model('User', userSchema)
module.exports = user
