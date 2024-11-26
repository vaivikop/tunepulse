'use client';
import React, { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getUserInfo, updateProfilePicture } from '@/services/dataAPI';
import { MdLogout } from 'react-icons/md';
import { toast } from 'react-hot-toast';

const Profile = ({ setShowNav }) => {
  const router = useRouter();
  const { status, data } = useSession();
  
  const [user, setUser] = useState(null);
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await getUserInfo();
      setUser(res);
    };
    fetchUser();
  }, [status]);

  const handleProfileClick = () => {
    if (status === 'authenticated') {
      setShowNav(false);
      router.push('/settings'); // Redirects to the settings page
    }
  };

  const handleImageChange = (e) => {
    setNewProfilePic(e.target.files[0]); // Store the selected image
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newProfilePic) {
      // Handle uploading the new profile picture
      try {
        const formData = new FormData();
        formData.append('image', newProfilePic); // Append the image to form data

        // Make API call to backend
        const res = await updateProfilePicture(formData);

        if (res.success) {
          toast.success('Profile picture updated successfully!');
          setIsEditing(false); // Close the edit form
          setUser({ ...user, imageUrl: res.imageUrl }); // Update the UI with the new profile picture
        } else {
          toast.error('Failed to update profile picture');
        }
      } catch (error) {
        toast.error('Error updating profile picture');
        console.error(error);
      }
    }
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  return (
    <div className="text-white">
      {status === 'loading' ? (
        <div className="ml-16">
          <span className="loading"></span>
        </div>
      ) : (
        <div>
          {status === 'unauthenticated' ? (
            <div className="flex gap-2 ml-5">
              <button
                onClick={() => {
                  setShowNav(false);
                  router.push('/login');
                }}
                className="border-2 px-3 py-1 m-2 rounded text-lg border-[#00e6e6]"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setShowNav(false);
                  router.push('/signup');
                }}
                className="border-2 px-3 py-1 m-2 rounded text-lg border-[#00e6e6]"
              >
                Signup
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-4 ml-1">
                <img
                  src={user?.imageUrl || data?.imageUrl || 'https://api.dicebear.com/6.x/thumbs/svg'}
                  alt="user"
                  width={50}
                  height={50}
                  className="rounded-full cursor-pointer"
                  onClick={handleProfileClick} // Event handler for profile click
                  title="Go to settings"
                />
                <div className="flex flex-col gap-1 w-full truncate cursor-pointer" onClick={handleProfileClick}>
                  <div className="flex justify-between items-center">
                    <h1 className="text-lg font-semibold">{data?.userName || user?.userName}</h1>
                    <MdLogout
                      size={20}
                      onClick={() => {
                        setShowNav(false);
                        signOut();
                      }}
                      className="cursor-pointer text-white hover:text-[#00e6e6]"
                    />
                  </div>
                  <h2 className="text-[10px] truncate">{data?.email || user?.email}</h2>
                </div>
              </div>
              <button
                onClick={handleEditToggle}
                className="mt-4 bg-[#00e6e6] text-black rounded p-2 hover:bg-[#00c0c0]"
              >
                Edit Profile
              </button>
              {isEditing && (
                <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-800">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                      <label htmlFor="profilePic" className="block text-sm font-medium">
                        Change Profile Picture:
                      </label>
                      <input
                        type="file"
                        id="profilePic"
                        name="profilePic"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-2 p-2 bg-black text-white border rounded"
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-4 bg-[#00e6e6] text-black rounded p-2 hover:bg-[#00c0c0]"
                    >
                      Save Changes
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
