import express from "express";
import User from "../db/userSchema.js";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyToken } from "../middleware/protectRoute.js";

dotenv.config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: {
    message:
      "Too many login attempts from this IP, please try again after 10 minutes",
  },
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
});

const JWT_SECRET = process.env.JWT_SECRET_CODE;

const router = express.Router();

router.post("/login", limiter, async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(401).json({ message: "login error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const existingUser = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(401)
        .json({ message: "User exists with entered username" });
    }
    if (existingEmail) {
      return res
        .status(401)
        .json({ message: "User exists with entered email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();
    return res.status(201).json({ message: "Signup Successful" });
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "Signup error" });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

router.get("/verify", verifyToken, (req, res) => {
  res.status(200).json({ message: "User is authenticated", user: req.user });
});

export default router;
