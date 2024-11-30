import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import User from '@/models/User'; // Assuming you have a user model
import connectDB from '@/utils/dbconnect'; // MongoDB connection utility
import { NextResponse } from 'next/server';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function POST(req) {
  try {
    // Step 1: Connect to MongoDB
    await connectDB();

    // Step 2: Parse the incoming request body
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Step 3: Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Step 4: Generate a JWT for the email verification
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });

    // Step 5: Construct the verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

    // Step 6: Send the verification email
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: user.email,
      subject: 'Verify Your Account - TunePulse',
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px; }
              .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
              .logo { max-width: 150px; margin-bottom: 20px; }
              .btn { background-color: #1da1f2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
              .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="email-container">
              <img src="https://res.cloudinary.com/dgrxq7vm5/image/upload/v1732945762/user_profiles/nnbddvreyelozffjlqiy.png" alt="TunePulse Logo" class="logo" />
              <h2>Verify Your Account</h2>
              <p>Hi ${user.userName},</p>
              <p>Thank you for registering with TunePulse. Please click the button below to verify your account:</p>
              <a href="${verificationUrl}" class="btn">Verify Account</a>
              <p>This token is valid for 10 minutes. If you did not request this, please ignore this email for security reasons.</p>
              <div class="footer">
                <p>If you didn't create an account with TunePulse, please ignore this email.</p>
                <p>&copy; 2024 TunePulse, All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Verification email sent' }, { status: 200 });

  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json({ error: 'Error sending verification email' }, { status: 500 });
  }
}
