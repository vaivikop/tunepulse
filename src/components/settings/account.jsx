"use client";

import React, { useState, useEffect } from "react";

const Account = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/userInfo"); // Updated API endpoint
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <p className="text-center text-cyan-400">Loading...</p>;
  }

  if (!userData) {
    return <p className="text-center text-red-500">Failed to load user data.</p>;
  }

  return (
    <div className="w-full bg-gray-900 text-white p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl text-cyan-400 font-semibold mb-6 text-center">Account Details</h2>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={userData?.imageUrl || "https://api.dicebear.com/6.x/thumbs/svg"}
          alt="Profile"
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-cyan-400 object-cover"
        />
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
            <span className="w-32 font-medium text-gray-300">Username:</span>
            <span className="text-gray-100">{userData?.userName || "N/A"}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
            <span className="w-32 font-medium text-gray-300">Email:</span>
            <span className="text-gray-100">{userData?.email || "N/A"}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
            <span className="w-32 font-medium text-gray-300">Verified:</span>
            <span className={`text-${userData?.isVerified ? "green" : "red"}-400`}>
              {userData?.isVerified ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
