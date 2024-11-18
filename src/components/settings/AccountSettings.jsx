'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getUserInfo } from '@/services/dataAPI';
import axios from 'axios';

const AccountSettings = () => {
  const router = useRouter();
  const { status } = useSession();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    imageUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [emailConfirmation, setEmailConfirmation] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Fetch user data if authenticated
  useEffect(() => {
    if (status === 'authenticated') {
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
      fetchUser();
    } else if (status === 'unauthenticated') {
      setShowLoginPrompt(true);
    }
  }, [status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, imageUrl: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // Email confirmation check
      if (formData.email && emailConfirmation !== formData.email) {
        setMessage('Email confirmation does not match!');
        setIsLoading(false);
        return;
      }

      // Create FormData for profile image upload if file exists
      const updateData = { ...formData };
      if (profileImageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', profileImageFile);
        imageFormData.append('upload_preset', 'ml_default'); // Replace with your Cloudinary preset
        const imageRes = await axios.post('https://api.cloudinary.com/v1_1/dgrxq7vm5/image/upload', imageFormData); // Replace with your Cloudinary endpoint
        updateData.imageUrl = imageRes.data.secure_url;
      }

      // Update MongoDB
      await axios.put('/api/userInfo', updateData); // Replace with the correct endpoint
      setMessage('Account updated successfully!');
    } catch (error) {
      console.error('Error updating account:', error);
      setMessage('Failed to update account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-white mb-4">Account Settings</h2>

      {isLoading && <p className="text-gray-400">Updating...</p>}
      {message && <p className={`text-${message.includes('success') ? 'green' : 'red'}-500`}>{message}</p>}

      {showLoginPrompt ? (
        <div className="text-white">
          <p className="mb-4">You are not authenticated. Please authenticate to access account settings.</p>
          <button
            onClick={handleLoginRedirect}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Login
          </button>
        </div>
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

          {/* Email Confirmation */}
          <div>
            <label className="block text-gray-400 mb-1">Confirm Email</label>
            <input
              type="email"
              value={emailConfirmation}
              onChange={(e) => setEmailConfirmation(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-gray-400 mb-1">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="block w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-700 file:text-white hover:file:bg-purple-800"
            />
            {formData.imageUrl && (
              <img src={formData.imageUrl} alt="Profile Preview" className="w-16 h-16 rounded-full mt-4" />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Account'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AccountSettings;
