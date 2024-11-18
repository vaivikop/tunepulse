import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    imageUrl: {
      type: String,
      required: true,
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
    pendingEmail: {  // New field for the pending email address
      type: String,
      default: null,
    },
    emailChangeToken: {  // New field for the token used for email change verification
      type: String,
      default: null,
    },
    emailChangeTokenExpires: {  // New field for expiration time of the email change token
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

export default mongoose.models.user ||
  mongoose.model("user", fileSchema, "user");
