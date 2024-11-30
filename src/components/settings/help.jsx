'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setProgress } from '@/redux/features/loadingBarSlice';
import { FaEnvelope, FaTicketAlt } from 'react-icons/fa'; // Import icons

const Help = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    message: '',
    priority: 'Medium',
    email: '', // Added email field
  });
  const [formError, setFormError] = useState('');
  const [showModal, setShowModal] = useState(false); // Manage modal visibility

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
  
    // Check if all required fields are filled
    if (!formData.title || !formData.category || !formData.message || !formData.email) {
      setFormError('Please fill in all required fields.');
      toast.error('Please fill in all required fields.');
      return;
    }
  
    try {
      dispatch(setProgress(70));
  
      // Prepare the request body as JSON (instead of FormData)
      const response = await fetch('/api/help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Explicitly set the content type as JSON
        },
        body: JSON.stringify(formData), // Send form data as JSON
      });
  
      const data = await response.json();
  
      if (response.ok && data.success) {
        toast.success(`Your support ticket with ID ${data.ticketId} has been submitted.`);
        setShowModal(false); // Close modal after submission
      } else {
        toast.error(data.message || 'Something went wrong.');
      }
    } catch (error) {
      toast.error(error?.message || 'Error occurred while submitting the ticket.');
    } finally {
      dispatch(setProgress(100));
    }
  };

  return (
    <div className="w-full max-w-full sm:max-w-3xl mx-auto mt-16 p-6 bg-gray-900 text-white rounded-lg border border-gray-700">
      {/* Main Cards Container */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between gap-6 mb-6">
        {/* Contact Email Card */}
        <div className="w-full sm:w-[48%] bg-gray-800 p-6 rounded-lg shadow-lg transform transition-all hover:scale-105 hover:shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <FaEnvelope className="text-cyan-400 text-4xl" />
            <div>
              <h3 className="text-xl font-semibold text-cyan-400">Contact Us</h3>
              <p className="text-sm text-gray-400">You can reach us at shahvaivik@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Raise Ticket Card */}
        <div
          className="w-full sm:w-[48%] bg-gray-800 p-6 rounded-lg shadow-lg transform transition-all hover:scale-105 hover:shadow-xl cursor-pointer"
          onClick={() => setShowModal(true)} // Trigger modal on click
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <FaTicketAlt className="text-cyan-400 text-4xl" />
            <div>
              <h3 className="text-xl font-semibold text-cyan-400">Raise a Ticket</h3>
              <p className="text-sm text-gray-400">Have an issue? Raise a ticket with us.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Help Form */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="w-full sm:w-1/2 bg-gray-900 p-6 rounded-lg shadow-xl overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-semibold text-cyan-400">Help & Support</h1>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-100"
              >
                &times; {/* Close button */}
              </button>
            </div>

            {formError && <div className="text-red-500 text-sm mb-4">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Input */}
              <div>
                <label className="block mb-2 text-lg font-medium" htmlFor="title">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Brief title of the issue"
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block mb-2 text-lg font-medium" htmlFor="category">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white"
                >
                  <option value="">Select Category</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Account Issue">Account Issue</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              {/* Message Textarea */}
              <div>
                <label className="block mb-2 text-lg font-medium" htmlFor="message">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Describe your issue..."
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white"
                  rows="5"
                />
              </div>

              {/* Priority Dropdown */}
              <div>
                <label className="block mb-2 text-lg font-medium" htmlFor="priority">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Email Input */}
              <div>
                <label className="block mb-2 text-lg font-medium" htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Your email address"
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 text-white p-3 rounded-md hover:bg-cyan-400"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;
