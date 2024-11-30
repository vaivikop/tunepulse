'use client';

import React, { useState } from "react";
import Account from "@/components/settings/account";
import Help from "@/components/settings/help";  // Assuming Help component is created in the `components/settings/help.jsx` file

const Settings = () => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const toggleAccountSettings = () => {
    setIsAccountOpen(!isAccountOpen);
  };

  const toggleHelpSettings = () => {
    setIsHelpOpen(!isHelpOpen);
  };

  return (
    <div className="w-full mx-auto mt-16 min-h-screen px-4 sm:px-8">
      <div className="flex justify-center items-center">
        <div className="container flex flex-col items-center w-full sm:w-[90vw] lg:w-3/4">
          <h1 className="text-4xl text-cyan-400 font-medium mb-8 text-center">Settings</h1>
          <div className="text-white flex flex-col text-base lg:text-xl gap-4 font-medium w-full">

            {/* Dropdown for Account Settings */}
            <div className="w-full bg-black p-4 rounded-lg border border-gray-700 mb-4">
              <button
                onClick={toggleAccountSettings}
                className="w-full text-left font-medium text-cyan-400 focus:outline-none flex justify-between items-center"
              >
                Account Settings
                <span className={`transform transition-transform ${isAccountOpen ? "rotate-180" : "rotate-0"}`}>
                  ▼
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ${isAccountOpen ? "max-h-screen" : "max-h-0"}`}
              >
                <div className="mt-4">
                  <Account user={{ userName: "John Doe", email: "john@example.com", isVerified: true, imageUrl: "" }} />
                </div>
              </div>
            </div>

            {/* Dropdown for Help Section */}
            <div className="w-full bg-black p-4 rounded-lg border border-gray-700 mb-16"> {/* Adjusted bottom margin */}
              <button
                onClick={toggleHelpSettings}
                className="w-full text-left font-medium text-cyan-400 focus:outline-none flex justify-between items-center"
              >
                Help & Support
                <span className={`transform transition-transform ${isHelpOpen ? "rotate-180" : "rotate-0"}`}>
                  ▼
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ${isHelpOpen ? "max-h-screen" : "max-h-0"}`}
              >
                <div className="mt-4">
                  <Help /> {/* Include the Help component here */}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
