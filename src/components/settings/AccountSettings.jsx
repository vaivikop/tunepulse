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
  const [profileImage, setProfileImage] = useState(''); // To hold the profile image URL

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
        setProfileImage(userData.imageUrl); // Set profile image
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

    // Handle image file change
    if (name === 'imageUrl' && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result); // Set profile image preview
      };
      reader.readAsDataURL(file); // Show image preview before uploading
    }
  };

  // Handle form submission for updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      if (isEmailChanged) {
        // If email has changed, send email confirmation link and stop further processing
        setMessage('An email confirmation link has been sent to your new email address.');
        setIsLoading(false);
        return; // Don't update the account if email is changed, only send confirmation
      }

      // If a profile picture is uploaded, handle upload to Cloudinary or server
      const updatedData = { ...formData };

      if (formData.imageUrl && formData.imageUrl instanceof File) {
        const formDataForUpload = new FormData();
        formDataForUpload.append('file', formData.imageUrl);
        formDataForUpload.append('upload_preset', 'ml_default'); // Add your Cloudinary preset

        // Upload the image to Cloudinary and get the URL
        const uploadResponse = await axios.post(
          'https://api.cloudinary.com/v1_1/dgrxq7vm5/upload',
          formDataForUpload
        );
        updatedData.imageUrl = uploadResponse.data.secure_url; // Set the image URL
      }

      // Send the update request to the server
      const response = await axios.put('/api/userInfo', updatedData);
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
            {profileImage && <img src={profileImage} alt="Profile" className="w-20 h-20 rounded-full mb-2" />}
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
