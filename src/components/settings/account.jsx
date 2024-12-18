'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast'; // Import toast for notifications
import { useRouter } from 'next/navigation'; // Import router to redirect

const Account = () => {
  const { status } = useSession(); // Session state from next-auth
  const [user, setUser] = useState(null); // Local state to store user data
  const [loading, setLoading] = useState(true); // Loading state to show loading skeleton
  const [isEditing, setIsEditing] = useState(false); // State to handle profile pic edit
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

  const handleVerifyAccount = async () => {
    try {
      const response = await fetch('/api/verifyAccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.userId }), // Send user ID to identify the user
      });

      const data = await response.json();

      if (data?.success) {
        toast.success('Verification email sent! Please check your inbox.');
      } else {
        toast.error(data?.message || 'Failed to send verification email.');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Error sending verification email');
    }
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

  const handleCancel = () => {
    setIsEditing(false); // Reset the editing state
    setNewImage(null); // Reset image selection
    setIsProfileUpdated(false); // Reset profile updated status
  };

  const handleSave = async () => {
    if (!newImage) {
      toast.error("No new image selected");
      return;
    }

    const imageFile = document.getElementById('profile-pic-input').files[0];
    const reader = new FileReader();

    // Convert the image file to base64
    reader.onloadend = async () => {
      const base64Image = reader.result; // This is the base64 string of the image

      const formData = new FormData();
      formData.append('image', base64Image);  // Add the base64 image string
      formData.append('userId', user.userId);  // Add the userId

      try {
        const response = await fetch('/api/uploadImage', {
          method: 'POST',
          body: formData,
        });

        // Check if the response is ok
        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.error || 'Error uploading image');
          return;
        }

        const data = await response.json();

        if (data.imageUrl) {
          console.log('Image URL:', data.imageUrl);  // Log the image URL to the console
          setUser((prevUser) => ({ ...prevUser, imageUrl: data.imageUrl }));
          setIsEditing(false);
          setIsProfileUpdated(false);
          toast.success("Profile picture updated successfully!");
        } else {
          toast.error("Image upload failed");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Error uploading image: " + (error?.message || "Unknown error"));
      }
    };

    reader.readAsDataURL(imageFile); // Convert the image to a base64 string
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
            src={newImage || user?.imageUrl || 'https://api.dicebear.com/6.x/thumbs/svg'} // Show the selected image or fallback to the default
            alt="Profile"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-cyan-400 object-cover cursor-pointer"
            onClick={handleProfileClick} // Trigger file input on click
          />
          {/* Edit Icon (only visible when isEditing is true) */}
          {isEditing && (
            <div className="absolute top-0 right-0 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center cursor-pointer">
              <span className="text-black text-xl">+</span> {/* Add icon */}
            </div>
          )}
          {/* File input for image upload */}
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
            <span className="text-gray-100">{user?.userName || 'N/A'}</span>
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

      {/* Edit Profile / Cancel / Save Buttons */}
      <div className="flex gap-4 mt-6">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)} // Edit button
            className="bg-cyan-500 text-white py-2 px-4 rounded-lg"
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              onClick={handleCancel} // Cancel button
              className="bg-red-500 text-white py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave} // Save button
              className="bg-green-500 text-white py-2 px-4 rounded-lg"
            >
              Save
            </button>
          </>
        )}
      </div>

      {/* Show the "Verify Your Account" button if not verified */}
      {!user?.isVerified && (
        <button
          onClick={handleVerifyAccount} // Trigger the account verification
          className="mt-4 bg-cyan-500 text-white py-2 px-4 rounded-lg"
        >
          Verify Your Account
        </button>
      )}
    </div>
  );
};

export default Account;
