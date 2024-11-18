import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import User from "@/models/User";
import dbConnect from "@/utils/dbconnect";

// Handle email confirmation
export async function POST(req) {
  const { token } = req.body;
  
  if (!token) {
    return NextResponse.json(
      { success: false, message: "No token provided" },
      { status: 400 }
    );
  }

  await dbConnect();

  // You need to validate the token (implement your own logic or use JWT)
  // For simplicity, we'll assume the token is valid and match it with the user's email change request
  const user = await User.findOne({ emailChangeToken: token });
  
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 400 }
    );
  }

  // Confirm the email change
  user.email = user.pendingEmail;
  user.isVerified = true; // Set to verified if necessary
  user.pendingEmail = null; // Clear pending email
  user.emailChangeToken = null; // Clear the token

  await user.save();

  return NextResponse.json(
    { success: true, message: "Email confirmed and updated successfully" },
    { status: 200 }
  );
}
