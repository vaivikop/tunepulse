'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getUserInfo, updateUserProfile } from '@/services/dataAPI'; // Assuming this function fetches and updates user data
import { useRouter } from 'next/navigation'; // Import router to redirect
import { toast } from 'react-hot-toast'; // Import toast for notifications

const Account = () => {
  const { status, data } = useSession(); // Session state from next-auth
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
        const res = await getUserInfo(); // Fetch user data from API
        setUser(res); // Set the user data
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchUser(); // Fetch user data only if authenticated
    }
  }, [status]);

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
      toast.error("No new image selected"); // Show error toast if no new image
      return; // If there's no new image, do nothing
    }

    // Get the selected image file and convert it to base64
    const imageFile = document.getElementById('profile-pic-input').files[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1]; // Extract base64 data from the result
      console.log("Base64 Image: ", base64Image); // Log the base64 image data for debugging

      // Ensure we are sending both image and user data
      if (!base64Image) {
        toast.error("Missing image data"); // Error if image is missing
        return;
      }

      try {
        // Send the base64 image data to the API to update the user's profile
        const updatedUser = await updateUserProfile({
          ...user, // Keep other user data
          imageUrl: base64Image, // Update imageUrl with new base64 image
        });

        // Update the user state with the updated data
        setUser(updatedUser);
        setIsEditing(false);
        setIsProfileUpdated(false);
        toast.success("Profile picture updated successfully!"); // Success toast
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Error updating profile: " + (error?.message || "Unknown error")); // Error toast for any update error
      }
    };

    if (imageFile) {
      reader.readAsDataURL(imageFile); // Convert the selected image file to base64
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
        ) : isProfileUpdated ? (
          <button
            onClick={handleSave} // Save button
            className="bg-cyan-500 text-white py-2 px-4 rounded-lg"
          >
            Update Profile
          </button>
        ) : (
          <button
            onClick={handleCancel} // Cancel button
            className="bg-red-500 text-white py-2 px-4 rounded-lg"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default Account;
