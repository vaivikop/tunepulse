'use client';
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import nodemailer from "nodemailer";
import User from "@/models/User";
import dbConnect from "@/utils/dbconnect";

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or use any other service you prefer
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or an app password
  },
});

// Send Email function
const sendEmail = (to, subject, text, html) => {
  return transporter.sendMail({
    from: process.env.EMAIL_USER, // sender address
    to, // receiver address
    subject, // Subject line
    text, // plain text body
    html, // html body
  });
};

// Get user info
export async function GET(req) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "User not logged in",
        data: null,
      },
      { status: 401 }
    );
  }

  try {
    await dbConnect();

    // Find the user by their email (using the token's email)
    const user = await User.findOne({ email: token.email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          data: null,
        },
        { status: 404 }
      );
    }

    // Determine whether the user is awaiting email confirmation
    const userData = {
      userName: user.userName,
      email: user.isVerified ? user.email : user.pendingEmail || user.email, // Display the verified email, or the pending email if not verified
      imageUrl: user.imageUrl,
      isVerified: user.isVerified, // Indicate whether the user has verified their email
    };

    return NextResponse.json(
      {
        success: true,
        message: "User found",
        data: userData,
      }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
        data: null,
      },
      { status: 500 }
    );
  }
}

// PUT /api/userInfo - Handle email change and send email confirmation
export async function PUT(req) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "User not logged in",
        data: null,
      },
      { status: 401 }
    );
  }

  const { userName, email, imageUrl } = req.body;

  try {
    await dbConnect();

    // Find the user by email
    const user = await User.findOne({ email: token.email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          data: null,
        },
        { status: 404 }
      );
    }

    // Check if the email has changed
    let isEmailChanged = false;

    if (user.email !== email) {
      user.pendingEmail = email;
      isEmailChanged = true;
      user.isVerified = false; // Set user as unverified until email is confirmed
    }

    // Update user information
    user.userName = userName || user.userName;
    user.imageUrl = imageUrl || user.imageUrl;

    await user.save();

    // If the email is changed, send confirmation email
    if (isEmailChanged) {
      const confirmationToken = jwt.sign(
        { email: email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Set token expiration time
      );

      const confirmationLink = `${process.env.BASE_URL}/confirm-email?token=${confirmationToken}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Confirm Your Email Address",
        text: `Please confirm your email address by clicking on the following link: ${confirmationLink}`,
        html: `<p>Please confirm your email address by clicking on the following link: <a href="${confirmationLink}">${confirmationLink}</a></p>`,
      };

      await sendEmail(mailOptions.to, mailOptions.subject, mailOptions.text, mailOptions.html);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account updated successfully. Please check your email to confirm the change.",
      }
    );
  } catch (error) {
    console.error("Error updating user info:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update account.",
        data: null,
      },
      { status: 500 }
    );
  }
}
