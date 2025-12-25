import express from "express"
import { auth } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.js"

const router = express.Router()

router.post("/files", auth, upload.single("file"), uploadFiles)
router.get("/files", auth, getUserFiles)

export default router
