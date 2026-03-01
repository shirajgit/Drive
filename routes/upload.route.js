
const express = require("express")
const multer = require("multer")
 
const User = require("../models/user.model")
const { auth } = require("../middlewares/auth.middleware")
 
 
const { uploadFile } = require("../services/storage.service")

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get('/files', auth, async (req, res) => {
  const user = await User.findById(req.userId)  
  res.render('uploads', { files: user.urls }) 
})


router.post("/files", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.redirect("/files");

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
 
     const file = req.file ;
     
     const result = await uploadFile(file.buffer.toString('base64'))


    const updatedUser = await User.findByIdAndUpdate(
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
 
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.redirect("/files");
  } catch (err) {
    console.error(err);
    res.redirect("/files");
  }
});


//data handling routes

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
