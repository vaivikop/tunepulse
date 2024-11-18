import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getUserInfo } from '@/services/dataAPI';
import axios from 'axios';

const AccountSettings = () => {
  const { status, data } = useSession();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    imageUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEmailChanged, setIsEmailChanged] = useState(false); // Track if email is changed

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserInfo();
        setUser(userData);
        setFormData({
          userName: userData.userName || '',
          email: userData.email || '',
          imageUrl: userData.imageUrl || '',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (status === 'authenticated') {
      fetchUser();
    }
  }, [status]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'email' && value !== user.email) {
      setIsEmailChanged(true); // Set email changed flag
    } else {
      setIsEmailChanged(false); // Reset if email is not changed
    }
  };

  // Handle form submission for updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (isEmailChanged) {
        setMessage('An email confirmation link has been sent to your new email address.');
        setIsLoading(false);
        return;
      }

      const response = await axios.put('/api/userInfo', formData);
      setMessage('Account updated successfully!');
      setIsLoading(false);
    } catch (error) {
      console.error('Error updating account:', error);
      setMessage('Failed to update account.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-white mb-4">Account Settings</h2>
      
      {isLoading && <p className="text-gray-400">Loading...</p>}
      {message && <p className="text-green-500">{message}</p>}

      {status === 'loading' ? (
        <p className="text-gray-400">Loading user data...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-gray-400 mb-1">Username</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-gray-400 mb-1">Profile Picture</label>
            <input
              type="file"
              name="imageUrl"
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Update Account
          </button>
        </form>
      )}
    </div>
  );
};

export default AccountSettings;
