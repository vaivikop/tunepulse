import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { ticketId, email, reply } = await req.json();

    if (!ticketId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: ticketId' },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: email' },
        { status: 400 }
      );
    }
    if (!reply) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: reply.' },
        { status: 400 }
      );
    }

    // Configure Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Construct email content
    const mailOptions = {
      from: `"TunePulse Support" | <${process.env.MAIL_USER}>`,
      to: email,
      subject: `Response to Your Ticket - ${ticketId}`,
      text: `
Dear User,

We have reviewed your ticket (ID: ${ticketId}) and provided the following response:

"${reply}"

If you have further concerns or questions, please feel free to reach out.

Best regards,  
The TunePulse Support Team
      `,
      html: `
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f7fc;
        color: #333;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #fff;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        border-bottom: 2px solid #007bff;
        padding-bottom: 10px;
      }
      .content {
        margin-top: 20px;
        line-height: 1.6;
      }
      .footer {
        margin-top: 20px;
        text-align: center;
        font-size: 14px;
        color: #777;
      }
      .footer a {
        color: #007bff;
        text-decoration: none;
      }
      .footer a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Response to Your Ticket</h1>
        <h2>ID: ${ticketId}</h2>
      </div>
      <div class="content">
        <p>Dear User,</p>
        <p>We have reviewed your ticket and provided the following response:</p>
        <blockquote style="margin: 20px; padding: 15px; background-color: #f4f7fc; border-left: 4px solid #007bff;">
          ${reply}
        </blockquote>
        <p>If you have further concerns or questions, please feel free to reach out.</p>
      </div>
      <div class="footer">
        <p>Best regards,</p>
        <p><strong>The TunePulse Support Team</strong></p>
        <p>
          &copy; 2024 TunePulse, All rights reserved.
          <br />
          <a href="mailto:${process.env.MAIL_USER}">Contact Support</a>
        </p>
      </div>
    </div>
  </body>
</html>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: 'Reply sent successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending reply email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send the reply. Please try again later.' },
      { status: 500 }
    );
  }
}
