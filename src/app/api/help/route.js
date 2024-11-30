import dbconnect from '@/utils/dbconnect';
import Ticket from '@/models/Ticket';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

// Helper to Generate Short Ticket ID
function generateShortTicketId() {
  return `T-${Date.now().toString(36).slice(-6)}-${Math.random().toString(36).slice(-4)}`;
}

// Validation Helper Function
function validateTicketData(data) {
  const { title, category, message, priority, email } = data;
  const errors = [];

  if (!title || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long.');
  }
  if (!category) {
    errors.push('Category is required.');
  }
  if (!message || message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long.');
  }
  if (!['Low', 'Medium', 'High'].includes(priority)) {
    errors.push('Priority must be one of Low, Medium, or High.');
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('A valid email address is required.');
  }

  return errors;
}

// API Handler for POST request
export async function POST(req) {
  try {
    // Connect to MongoDB
    await dbconnect();

    // Parse the incoming JSON body
    const { title, category, message, priority, email } = await req.json();

    // Validate the data
    const errors = validateTicketData({ title, category, message, priority, email });
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: errors.join(', ') },
        { status: 400 }
      );
    }

    // Generate short ticket ID
    const ticketId = generateShortTicketId();

    // Save the ticket to the database (no image URL needed now)
    const newTicket = new Ticket({
      ticketId,
      title,
      category,
      message,
      priority,
      email,
      status: 'Open',
      createdAt: new Date(),
    });

    await newTicket.save();

    // Send confirmation email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: `Ticket Created - ${ticketId}`,
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f7fc;
                color: #333;
              }
              .container {
                width: 100%;
                max-width: 600px;
                margin: 20px auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }
              h1 {
                color: #007bff;
                font-size: 24px;
                margin-bottom: 10px;
              }
              h3 {
                font-size: 18px;
                margin-top: 20px;
                margin-bottom: 10px;
                color: #555;
              }
              ul {
                list-style-type: none;
                padding: 0;
              }
              ul li {
                margin-bottom: 10px;
                font-size: 16px;
              }
              .footer {
                margin-top: 20px;
                font-size: 14px;
                color: #777;
                text-align: center;
              }
              .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #007bff;
                color: #fff;
                text-decoration: none;
                border-radius: 4px;
                text-align: center;
                font-size: 16px;
                margin-top: 20px;
              }
              .button:hover {
                background-color: #0056b3;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Ticket Created Successfully!</h1>
              <p>Thank you for reaching out to us. Your support ticket has been created successfully. Here are the details of your ticket:</p>
              
              <h3>Ticket Information</h3>
              <ul>
                <li><strong>Ticket ID:</strong> ${ticketId}</li>
                <li><strong>Title:</strong> ${title}</li>
                <li><strong>Category:</strong> ${category}</li>
                <li><strong>Priority:</strong> ${priority}</li>
                <li><strong>Status:</strong> Open</li>
              </ul>

              <p>We will get back to you shortly to resolve your issue. You can track the progress of your ticket by visiting your account page.</p>

              <a href="#" class="button">Visit Support Portal</a>

              <div class="footer">
                <p>If you have any further questions, feel free to reply to this email or contact us directly at shahvaivik@gmail.com.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: 'Ticket created successfully!', ticketId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

// Fetch all tickets
export async function GET(req) {
  try {
    // Connect to MongoDB
    await dbconnect();

    // Retrieve all tickets
    const tickets = await Ticket.find();

    return NextResponse.json(
      { success: true, tickets },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching tickets.' },
      { status: 500 }
    );
  }
}
