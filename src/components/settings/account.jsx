'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getUserInfo } from '@/services/dataAPI'; // Assuming this fetches user data
import { useRouter } from 'next/navigation'; // Import router to redirect
import { toast } from 'react-hot-toast'; // Import toast for notifications

const Account = () => {
  const { status } = useSession(); // Session state from next-auth
  const [user, setUser] = useState(null); // Local state to store user data
  const [loading, setLoading] = useState(true); // Loading state to show loading skeleton
  const [isEditing, setIsEditing] = useState(false); // State to handle profile pic edit
  const [isEditingUsername, setIsEditingUsername] = useState(false); // State for editing username
  const [newUsername, setNewUsername] = useState(''); // State to handle new username
  const [newImage, setNewImage] = useState(null); // State to handle new image selection
  const [isProfileUpdated, setIsProfileUpdated] = useState(false); // State to track profile update
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        
        if (status === 'authenticated') {
          const res = await fetch('/api/userInfo'); // Call user info API

          const data = await res.json();

          if (data?.success && data?.data) {
            setUser(data.data); // Set the user data (including userId, username, etc.)
            setNewUsername(data.data.userName); // Set the initial username
          } else {
            toast.error('Failed to fetch user info');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser(); // Fetch user data if authenticated
  }, [status]);

  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value); // Update the username state
  };

  const handleProfileClick = () => {
    if (status === 'authenticated') {
      setIsEditing(true); // Show file input when profile picture is clicked
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(URL.createObjectURL(file)); // Create object URL to show selected image
      setIsProfileUpdated(true); // Mark that the profile has been updated
    }
  };

  const handleSave = async () => {
    if (newImage || newUsername) {
      const formData = new FormData();
      if (newImage) {
        const imageFile = document.getElementById('profile-pic-input').files[0];
        const reader = new FileReader();

        reader.onloadend = async () => {
          const base64Image = reader.result; // This is the base64 string of the image
          formData.append('image', base64Image);
          
          // Send formData to backend to update profile
          await updateProfile(formData);
        };

        reader.readAsDataURL(imageFile); // Convert the image to a base64 string
      }

      if (newUsername) {
        formData.append('userName', newUsername);
        // Send formData to backend to update username
        await updateProfile(formData);
      }
    } else {
      toast.error('No changes detected');
    }
  };

  const updateProfile = async (formData) => {
    try {
      const response = await fetch('/api/updateProfile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error updating profile');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setUser((prevUser) => ({ ...prevUser, userName: newUsername, imageUrl: data.imageUrl }));
        setIsEditing(false);
        setIsProfileUpdated(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Profile update failed');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    }
  };

  if (status === 'unauthenticated') {
    return (
      <div className="text-center text-red-500 mt-16">
        <p>
          You are not logged in.{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-cyan-400 font-semibold hover:underline"
          >
            Please log in first
          </button>
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-16">
        <div className="w-1/2 space-y-4">
          <div className="h-32 bg-gray-700 rounded-md animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-700 rounded-md animate-pulse"></div>
            <div className="h-6 bg-gray-700 rounded-md animate-pulse"></div>
            <div className="h-6 bg-gray-700 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <p className="text-center text-red-500">Failed to load user data.</p>;
  }

  return (
    <div className="w-full bg-gray-900 text-white p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl text-cyan-400 font-semibold mb-6 text-center">Account Details</h2>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative">
          {/* Profile Picture */}
          <img
            src={newImage || user?.imageUrl || 'https://api.dicebear.com/6.x/thumbs/svg'}
            alt="Profile"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-cyan-400 object-cover cursor-pointer"
            onClick={handleProfileClick}
          />
          {isEditing && (
            <div className="absolute top-0 right-0 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center cursor-pointer">
              <span className="text-black text-xl">+</span>
            </div>
          )}
          {isEditing && (
            <input
              type="file"
              onChange={handleImageChange}
              className="absolute top-0 right-0 opacity-0 cursor-pointer"
              id="profile-pic-input"
            />
          )}
        </div>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 border-b border-gray-600 pb-4">
            <span className="w-32 font-medium text-gray-300">Username:</span>
            {isEditingUsername ? (
              <input
                type="text"
                value={newUsername}
                onChange={handleUsernameChange}
                className="text-gray-100 bg-gray-700 p-2 rounded-md"
              />
            ) : (
              <span className="text-gray-100">{user?.userName || 'N/A'}</span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 border-b border-gray-600 pb-4">
            <span className="w-32 font-medium text-gray-300">Email:</span>
            <span className="text-gray-100">{user?.email || 'N/A'}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
            <span className="w-32 font-medium text-gray-300">Verified:</span>
            <span className={`text-${user?.isVerified ? 'green' : 'red'}-400`}>
              {user?.isVerified ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-4 mt-6">
        {!isEditing ? (
          <button
            onClick={() => setIsEditingUsername(true)}
            className="bg-cyan-500 text-white py-2 px-4 rounded-lg"
          >
            Edit Username
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="bg-cyan-500 text-white py-2 px-4 rounded-lg"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
};

export default Account;
