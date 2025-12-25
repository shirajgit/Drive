import jwt from "jsonwebtoken"

export const auth = (req, res, next) => {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token." })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." })
  }
}

 