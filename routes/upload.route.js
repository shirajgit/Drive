
const express = require("express")
const multer = require("multer")
const supabase = require("../config/supabaseClient")
const User = require("../models/user.model")
const { auth } = require("../middlewares/auth.middleware")

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get('/files', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('urls')
  res.render('uploads', { files: user.urls })
})


router.post("/files", auth, upload.single("file"), async (req, res) => {
  try {
    const file = req.file
    if (!file) return res.redirect("/files")

    // 🔹 Upload to Supabase
    const filePath = `users/${req.userId}/${Date.now()}-${file.originalname}`

    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype
      })

    if (error) throw error

    // 🔹 Get public URL
    const { data: publicData } = supabase.storage
      .from("uploads")
      .getPublicUrl(filePath)

    // 🔹 ✅ ADD HERE (THIS IS YOUR CODE)
    await User.findByIdAndUpdate(req.userId, {
      $push: {
        urls: {
          fileUrl: publicData.publicUrl,
          fileName: file.originalname,
          fileType: file.mimetype,   // 👈 added here
          uploadedAt: new Date()
        }
      }
    })

    res.redirect("/files")

  } catch (err) {
    console.error(err)
    res.redirect("/files")
  }
})


router.post("/delete-file/:id", auth, async (req, res) => {
  try {
    const fileId = req.params.id

    await User.findByIdAndUpdate(req.userId, {
      $pull: { urls: { _id: fileId } }
    })

    res.redirect("/files")
  } catch (err) {
    res.status(500).send("Delete failed")
  }
})


module.exports = router
