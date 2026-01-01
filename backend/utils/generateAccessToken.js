import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  if (!user?._id || !user?.role) {
    throw new Error("Invalid user data for token generation");
  }

  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
  );
};
