import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken'; // Use JWT for token signing and verification
import User from '@/models/User';
import dbConnect from '@/utils/dbconnect';

const JWT_SECRET = process.env.JWT_SECRET; // Ensure you have a secret in .env

// Handle email confirmation
export async function POST(req) {
  const { token } = req.body;

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'No token provided' },
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    // Step 1: Verify the token
    const decoded = jwt.verify(token, JWT_SECRET); // Decode and verify the token
    const { email } = decoded; // Assuming the token contains the email (or another identifier)

    // Step 2: Check if the user exists and if the token is associated with an email change request
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Step 3: Check if the token matches the pending email change request
    if (user.emailChangeToken !== token) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Step 4: Update the user's email and clear the pending change and token
    user.email = user.pendingEmail;
    user.pendingEmail = null; // Clear the pending email
    user.emailChangeToken = null; // Clear the token
    user.isVerified = true; // Optional: mark the user as verified if required

    // Save the user data with the updated email
    await user.save();

    // Step 5: Return success
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
