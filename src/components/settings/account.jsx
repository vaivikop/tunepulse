"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getUserInfo } from "@/services/dataAPI"; // Assuming this function fetches the user data

const Account = () => {
  const { status, data } = useSession(); // Session state from next-auth
  const [user, setUser] = useState(null); // Local state to store user data
  const [loading, setLoading] = useState(true); // Loading state to show loading spinner

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await getUserInfo(); // Fetch user data from API
        setUser(res); // Set the user data
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchUser(); // Fetch user data only if authenticated
    }
  }, [status]);

  if (loading) {
    return <div className="ml-16"><span className="loading"></span></div>; // Display loading spinner while fetching data
  }

  if (!user) {
    return <p className="text-center text-red-500">Failed to load user data.</p>; // If no user data
  }

  return (
    <div className="w-full bg-gray-900 text-white p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl text-cyan-400 font-semibold mb-6 text-center">Account Details</h2>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={user?.imageUrl || "https://api.dicebear.com/6.x/thumbs/svg"} // Default to Dicebear image if not available
          alt="Profile"
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-cyan-400 object-cover"
        />
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
            <span className="w-32 font-medium text-gray-300">Username:</span>
            <span className="text-gray-100">{user?.userName || "N/A"}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
            <span className="w-32 font-medium text-gray-300">Email:</span>
            <span className="text-gray-100">{user?.email || "N/A"}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
            <span className="w-32 font-medium text-gray-300">Verified:</span>
            <span className={`text-${user?.isVerified ? "green" : "red"}-400`}>
              {user?.isVerified ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
