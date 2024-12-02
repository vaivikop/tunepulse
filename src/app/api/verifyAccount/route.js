const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("@/models/User"); // Assuming you have a user model
const connectDB = require("@/utils/dbconnect"); // MongoDB connection utility
const { NextResponse } = require("next/server");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function POST(req) {
  try {
    await connectDB();
    const { userId, token } = await req.json();

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (user.isVerified) {
        return NextResponse.json(
          { success: false, message: "User is already verified" },
          { status: 400 }
        );
      }

      user.isVerified = true;
      await user.save();

      return NextResponse.json(
        { success: true, message: "Account verified successfully" },
        { status: 200 }
      );
    }

    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "10m",
      });
      const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

      const mailOptions = {
        from: `"TunePulse Support" <${process.env.MAIL_USER}>`,
        to: user.email,
        subject: "Verify Your Account - TunePulse",
        text: `Hi ${user.userName}, Please verify your account using this link: ${verificationUrl}`,
        html: `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9f9f9; color: #333; padding: 20px; }
                .email-container { max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); }
                .button { display: inline-block; padding: 10px 20px; background-color: #1da1f2; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
                .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="email-container">
                <h2>Verify Your Account</h2>
                <p>Hello ${user.userName},</p>
                <p>Thank you for joining TunePulse! Please verify your account by clicking the button below:</p>
                <a href="${verificationUrl}" class="button">Verify Account</a>
                <p>If you didn't create this account, please ignore this email.</p>
                <p>This verification link will expire in 10 minutes.</p>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} TunePulse, All Rights Reserved</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);

      return NextResponse.json(
        { success: true, message: "Verification email sent", info },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Missing userId or token" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
