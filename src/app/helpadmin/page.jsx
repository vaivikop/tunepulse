'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const HelpAdmin = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch tickets from the API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/help', {
          method: 'GET',
        });
        const data = await response.json();

        if (response.ok) {
          setTickets(data.tickets || []);
        } else {
          setError(data.message || 'Failed to fetch tickets');
        }
      } catch (err) {
        setError('An error occurred while fetching tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Navigate to ticket details
  const handleCardClick = (ticketId) => {
    router.push(`/helpadmin/${ticketId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Help Admin</h1>

        {loading && <p className="text-gray-500">Loading tickets...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.ticketId}
              onClick={() => handleCardClick(ticket.ticketId)}
              className="cursor-pointer bg-white p-6 shadow-md rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {ticket.title}
              </h2>
              <p className="text-sm text-gray-500 mb-1">
                <strong>Category:</strong> {ticket.category}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                <strong>Priority:</strong>{' '}
                <span
                  className={`${
                    ticket.priority === 'High'
                      ? 'text-red-500'
                      : ticket.priority === 'Medium'
                      ? 'text-yellow-500'
                      : 'text-green-500'
                  } font-semibold`}
                >
                  {ticket.priority}
                </span>
              </p>
              <p className="text-sm text-gray-500 mb-1">
                <strong>Status:</strong> {ticket.status}
              </p>
              <p className="text-gray-700 line-clamp-3">
                {ticket.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpAdmin;
