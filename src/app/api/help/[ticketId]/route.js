import dbconnect from '@/utils/dbconnect';  // Your DB connection utility
import Ticket from '@/models/Ticket';       // Your Ticket model
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';        // Import Nodemailer for sending emails

export async function GET(req, { params }) {
  const { ticketId } = params;

  try {
    await dbconnect();

    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Ticket not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, ticket },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching ticket details.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  const { ticketId } = params;
  const { status } = await req.json();

  try {
    await dbconnect();

    const ticket = await Ticket.findOneAndUpdate(
      { ticketId },
      { status },
      { new: true }
    );

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Ticket not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Ticket status updated successfully.', ticket },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while updating ticket.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { ticketId } = params;

  try {
    // Connect to the database
    await dbconnect();

    // Find and delete the ticket by ticketId
    const ticket = await Ticket.findOneAndDelete({ ticketId });

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Ticket not found.' },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json(
      { success: true, message: 'Ticket deleted successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while deleting the ticket.' },
      { status: 500 }
    );
  }
}
