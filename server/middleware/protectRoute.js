import jwt from "jsonwebtoken";
import env from "dotenv";

env.config();

const JWT_SECRET = process.env.JWT_SECRET_CODE;

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token found" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
