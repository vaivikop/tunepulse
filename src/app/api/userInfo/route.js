import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import User from "@/models/User";
import dbConnect from "@/utils/dbconnect";
import nodemailer from "nodemailer"; // To send email for confirmation

// Helper function to send confirmation email
const sendConfirmationEmail = (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Change Confirmation",
    html: `<p>Click the link below to confirm your email change:</p>
           <a href="${process.env.BASE_URL}/confirm-email?token=${token}">Confirm Email</a>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Handle GET and PUT requests
export async function handler(req) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "User not logged in",
        data: null
      },
      { status: 401 }
    );
  }

  await dbConnect();

  const user = await User.findOne({ email: token.email });
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "User not found",
        data: null
      },
      { status: 404 }
    );
  }

  if (req.method === "GET") {
    // Handle GET request to fetch user info
    return NextResponse.json(
      {
        success: true,
        message: "User found",
        data: {
          userName: user.userName,
          email: user.email,
          imageUrl: user.imageUrl,
          isVerified: user.isVerified
        }
      }
    );
  }

  if (req.method === "PUT") {
    // Handle PUT request to update user info
    const { userName, email, imageUrl } = req.body;

    // If the email has changed, initiate email confirmation
    if (email !== user.email) {
      const emailChangeToken = Math.random().toString(36).substr(2); // Generate a token for email confirmation

      // Send confirmation email
      sendConfirmationEmail(email, emailChangeToken);

      return NextResponse.json(
        {
          success: true,
          message: "Email confirmation required. Please check your inbox."
        },
        { status: 200 }
      );
    }

    // Update user details
    try {
      user.userName = userName || user.userName;
      user.email = email || user.email;
      user.imageUrl = imageUrl || user.imageUrl;

      await user.save();

      return NextResponse.json(
        {
          success: true,
          message: "Account updated successfully!",
          data: {
            userName: user.userName,
            email: user.email,
            imageUrl: user.imageUrl
          }
        },
        { status: 200 }
      );
    } catch (e) {
      console.error(e);
      return NextResponse.json(
        {
          success: false,
          message: "Error updating account",
          data: null
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    {
      success: false,
      message: "Method Not Allowed",
      data: null
    },
    { status: 405 }
  );
}
