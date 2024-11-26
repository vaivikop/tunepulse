import mongoose from "mongoose";

// Define user schema
const fileSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Make sure email is unique
    },
    password: {
      type: String,
      required: true, // Make sure password is required
    },
    imageUrl: {
      type: String,
      default: "https://api.dicebear.com/6.x/thumbs/svg", // Default image if none provided
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpires: {
      type: Date,
      default: null,
    },
    userData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userData",
    },
  },
  { timestamps: true }
);

// Before saving, ensure password is hashed if it's being updated
fileSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Export the user model
export default mongoose.models.user || mongoose.model("user", fileSchema, "user");
