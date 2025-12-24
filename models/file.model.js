const mongoose = require('mongoose')

const FileSchema = new mongoose.Schema({
  fileUrl: String,
  fileName: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('File', FileSchema)
