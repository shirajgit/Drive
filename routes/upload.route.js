const express = require('express')
const File = require('../models/file.model')
const multer = require('multer')
const supabase = require('../config/supabaseClient')

const router = express.Router()

// ✅ Multer with memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})


// GET all uploaded files
router.get('/files', async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 })
    res.render('uploads', { files })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// server.js or routes/upload.js
router.post('/upload-files', upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    if (!file) throw new Error("No file uploaded")

    // Supabase upload
    const filePath = `uploads/${Date.now()}-${file.originalname}`
    const { error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype
      })

    if (error) throw error

    const { data } = supabase.storage.from('uploads').getPublicUrl(filePath)

    // Optionally store in Mongo
    await File.create({
      fileUrl: data.publicUrl,
      fileName: file.originalname
    })

    res.redirect('/files');

  } catch (err) {
    console.error("Upload error:", err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})


 


module.exports = router
