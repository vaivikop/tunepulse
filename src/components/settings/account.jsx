'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getUserInfo } from '@/services/dataAPI';
import { MdLogout } from 'react-icons/md';
import { FaCamera } from 'react-icons/fa'; // Icon for editing profile picture

const Profile = () => {
  const router = useRouter();
  const { status, data } = useSession();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await getUserInfo();
      setUser(res);
    };
    if (status === 'authenticated') {
      fetchUser();
    }
  }, [status]);

  const handleProfileClick = () => {
    if (status === 'authenticated') {
      router.push('/settings'); // Redirects to the settings page
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    // You would typically upload the image to the backend here
    console.log(file);
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
                onClick={() => router.push('/login')}
                className="border-2 px-3 py-1 m-2 rounded text-lg border-[#00e6e6]"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="border-2 px-3 py-1 m-2 rounded text-lg border-[#00e6e6]"
              >
                Signup
              </button>
            </div>
          ) : (
            <div className="flex gap-4 ml-1">
              <div className="relative">
                <img
                  src={data?.imageUrl || user?.imageUrl || "https://api.dicebear.com/6.x/thumbs/svg"}
                  alt="user"
                  width={50}
                  height={50}
                  className="rounded-full cursor-pointer"
                  onClick={handleProfileClick}
                  title="Go to settings"
                />
                {/* Edit Icon */}
                {isEditing ? (
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="absolute top-0 right-0 opacity-0 cursor-pointer"
                    id="profile-pic-input"
                  />
                ) : (
                  <FaCamera
                    size={20}
                    className="absolute top-0 right-0 text-white cursor-pointer"
                    onClick={() => setIsEditing(true)} // Show the file input
                  />
                )}
              </div>
              <div className="flex flex-col gap-1 w-full truncate cursor-pointer">
                <div className="flex justify-between items-center">
                  <h1 className="text-lg font-semibold">
                    {data?.userName || user?.userName}
                  </h1>
                  <MdLogout
                    size={20}
                    onClick={() => router.push('/login')} // Logout logic here
                    className="cursor-pointer text-white hover:text-[#00e6e6]"
                  />
                </div>
                <h2 className="text-[10px] truncate">
                  {data?.email || user?.email}
                </h2>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
