'use client';
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"; // Use JWT for token verification
import User from "@/models/User";
import dbConnect from "@/utils/dbconnect";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  const { token } = req.body;

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'No token provided' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const decoded = jwt.verify(token, JWT_SECRET); // Verify the token
    const { email } = decoded;

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the token matches the email change request
    if (user.emailChangeToken !== token || user.emailChangeTokenExpires < Date.now()) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Confirm the email change
    user.email = user.pendingEmail;
    user.pendingEmail = null; // Clear pending email
    user.emailChangeToken = null; // Clear token
    user.emailChangeTokenExpires = null; // Clear token expiry

    await user.save();

    return NextResponse.json(
      { success: true, message: 'Email confirmed and updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error confirming email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to confirm email. Invalid or expired token.' },
      { status: 500 }
    );
  }
}
