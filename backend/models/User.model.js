import mongoose, { Schema } from "mongoose";


const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true,
       match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    refreshTokens: [
  {
    tokenHash: String,
    createdAt: Date,
    expiresAt: Date
  }],

    isActive: {
      type: Boolean,
      default: true,
    },

    passwordChangedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User',userSchema);
export default User;