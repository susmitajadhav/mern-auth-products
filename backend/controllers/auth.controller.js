import User from "../models/User.model.js";
import { generateAccessToken } from "../utils/generateAccessToken.js";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/refreshToken.utils.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

/* =========================
   REGISTER
========================= */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User Created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   LOGIN
========================= */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required" });
    }

    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /* ---------- ACCESS TOKEN ---------- */
    const accessToken = generateAccessToken(user);

    /* ---------- REFRESH TOKEN ---------- */
    const tokenId = crypto.randomUUID();
    const refreshToken = generateRefreshToken({
      userId: user._id,
      tokenId,
    });

    user.refreshTokens.push({
      tokenHash: hashRefreshToken(refreshToken),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await user.save();

    /* ---------- COOKIE (LOCAL DEV SAFE) ---------- */
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction, // ✅ true on Render
      sameSite: isProduction ? "none" : "lax",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    An;
    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   REFRESH TOKEN
========================= */
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.sendStatus(403);
    }

    const tokenHash = hashRefreshToken(refreshToken);

    const user = await User.findOne({
      _id: payload.userId,
      "refreshTokens.tokenHash": tokenHash,
    });

    /* ---------- REUSE DETECTION ---------- */
    if (!user) {
      await User.updateOne(
        { _id: payload.userId },
        { $set: { refreshTokens: [] } }
      );
      return res.sendStatus(403);
    }

    /* ---------- ROTATION ---------- */
    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.tokenHash !== tokenHash
    );

    const newTokenId = crypto.randomUUID();
    const newRefreshToken = generateRefreshToken({
      userId: user._id,
      tokenId: newTokenId,
    });

    user.refreshTokens.push({
      tokenHash: hashRefreshToken(newRefreshToken),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await user.save();

    /* ---------- SET NEW COOKIE ---------- */
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction, // ✅ true on Render
      sameSite: isProduction ? "none" : "lax",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    An;
    return res.json({
      accessToken: generateAccessToken(user),
    });
  } catch (err) {
    // FINAL SAFETY NET — prevents 500 during frontend bootstrap
    return res.sendStatus(401);
  }
};

/* =========================
   LOGOUT
========================= */
export const logoutUser = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);

  const tokenHash = hashRefreshToken(refreshToken);

  await User.updateOne(
    { "refreshTokens.tokenHash": tokenHash },
    { $pull: { refreshTokens: { tokenHash } } }
  );

  const isProduction = process.env.NODE_ENV === "production";

res.clearCookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: isProduction,               // ✅ true on Render
  sameSite: isProduction ? "none" : "lax",
  path: "/api/auth/refresh",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});




  return res.sendStatus(204);
};
