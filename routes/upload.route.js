
const express = require("express")
const multer = require("multer")
const supabase = require("../config/supabaseClient")
const User = require("../models/user.model")
const { auth } = require("../middlewares/auth.middleware")
const File = require( '../models/file.model'); // ✅ REQUIRED
const user = require("../models/user.model")
const { uploadFile } = require("../services/storage.service")

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get('/files', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('urls')
  const files = await File.find();
 
  res.render('uploads', { files: user.urls })

})


router.post("/files", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.redirect("/files");

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
 
     const file = req.file ;
    // const filePath = `users/${req.userId}/${Date.now()}-${req.file.originalname}`;

    // const { error } = await supabase.storage
    //   .from("uploads")
    //   .upload(filePath, req.file.buffer, {
    //     contentType: req.file.mimetype
    //   });

    // if (error) throw error;

    // const { data } = supabase.storage
    //   .from("uploads")
    //   .getPublicUrl(filePath);

     const result = await uploadFile(file.buffer.toString('base64'))


    const updatedUser = await user.findByIdAndUpdate(
      req.userId,
      {
        $push: {
          urls: {
            fileUrl: result.url,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            uploadedAt: new Date()
          }
        }
      },
      { new: true } 
    );

    console.log(result) 

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.redirect("/files");
  } catch (err) {
    console.error(err);
    res.redirect("/files");
  }
});



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
 
router.get('/images', auth, async (req, res) => {
  try {
    const userData = await User.findById(req.userId);

    // Filter only image files
    const files = userData.urls.filter(file =>
      file.fileType?.startsWith('image/') || 
      /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.fileName)
    );

    res.render('uploads', { files });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});



router.get('/videos', auth, async (req, res) => {
  const userData = await User.findById(req.userId);

  const files = userData.urls.filter(file =>
  /\.(mp4|webm|mkv|avi|mov)$/i.test(file.fileName)
);


  res.render('uploads', { files });
});


router.get('/audio', auth, async (req, res) => {
  const userData = await User.findById(req.userId);

  const files = userData.urls.filter(file =>
    file.fileType?.startsWith('audio/') ||
    /\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(file.fileName)
  );

  res.render('uploads', { files });
});

router.get('/zip', auth, async (req, res) => {
  const userData = await User.findById(req.userId);

  const files = userData.urls.filter(file =>
    file.fileType?.includes('zip') ||
    file.fileType?.includes('rar') ||
    file.fileType?.includes('7z') ||
    /\.(zip|rar|7z)$/i.test(file.fileName)
  );

  res.render('uploads', { files });
});


router.get('/apks', auth, async (req, res) => {
  const userData = await User.findById(req.userId);

  const files = userData.urls.filter(file =>
    file.fileType?.includes('android.package-archive') ||
    file.fileType === 'application/octet-stream' ||
    /\.apk$/i.test(file.fileName)
  );

  res.render('uploads', { files });
});



router.get('/pdfs', auth, async (req, res) => {
  const userData = await User.findById(req.userId);

  const files = userData.urls.filter(file =>
    file.fileType === 'application/pdf'
  );

  res.render('uploads', { files });
});
 

module.exports = router
