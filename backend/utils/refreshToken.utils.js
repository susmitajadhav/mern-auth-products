import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateRefreshToken = ({ userId, tokenId }) => {
  if (!userId || !tokenId) {
   throw new Error("Invalid payload for refresh token");
  }

  return jwt.sign(
    { userId, tokenId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
};

export const hashRefreshToken = (token) => {
  if (!token) {
    throw new Error("token require for hashing");
  }
  return crypto.createHash("sha256").update(token).digest("hex");
};
