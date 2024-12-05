'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const TicketDetail = () => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('');
  
  const { ticketId } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (!ticketId) return;

    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/help/${ticketId}`);
        const data = await response.json();

        if (response.ok) {
          setTicket(data.ticket);
          setStatus(data.ticket.status); // Initialize status from fetched ticket
        } else {
          setError(data.message || 'Failed to fetch ticket details');
        }
      } catch (err) {
        setError('An error occurred while fetching ticket details');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  const handleReplySubmit = async () => {
    if (!reply.trim()) {
      alert('Please write a reply before sending.');
      return;
    }

    try {
      const response = await fetch('/api/help/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          email: ticket.email,
          reply,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Reply sent successfully!');
        setReply('');
      } else {
        alert(data.message || 'Failed to send reply');
      }
    } catch (err) {
      alert('An error occurred while sending the reply');
    }
  };

  const handleDeleteTicket = async () => {
    if (confirm('Are you sure you want to delete this ticket?')) {
      try {
        const response = await fetch(`/api/help/${ticketId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Ticket deleted successfully.');
          router.push('/helpadmin'); // Redirect to the help page
        } else {
          const data = await response.json();
          alert(data.message || 'Failed to delete ticket.');
        }
      } catch (err) {
        alert('An error occurred while deleting the ticket.');
      }
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const response = await fetch(`/api/help/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Ticket status updated successfully.');
        setTicket((prev) => ({ ...prev, status })); // Update the local state
      } else {
        alert(data.message || 'Failed to update ticket status.');
      }
    } catch (err) {
      alert('An error occurred while updating ticket status.');
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading ticket details...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Ticket Details</h1>

        <p className="text-gray-700 mb-2"><strong>Title:</strong> {ticket.title || 'No Title Provided'}</p>
        <p className="text-gray-700 mb-2"><strong>Email:</strong> {ticket.email || 'No Email Provided'}</p>
        <p className="text-gray-700 mb-2"><strong>Category:</strong> {ticket.category || 'No Category Provided'}</p>
        <p className="text-gray-700 mb-2">
          <strong>Status:</strong>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="ml-2 border border-gray-300 rounded px-2 py-1"
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          <button
            onClick={handleStatusUpdate}
            className="ml-4 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            Update Status
          </button>
        </p>
        <p className="text-gray-700 mb-4"><strong>Message:</strong> {ticket.message || 'No Message Provided'}</p>

        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write your reply..."
          className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 mb-4"
        ></textarea>
        <button
          onClick={handleReplySubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Send Reply
        </button>

        <button
          onClick={handleDeleteTicket}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Delete Ticket
        </button>
      </div>
    </div>
  );
};

export default TicketDetail;
