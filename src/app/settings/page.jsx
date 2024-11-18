'use client';
import React from 'react';
import AccountSettings from '@/components/settings/AccountSettings';


const Settings = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-white">Settings</h1>
      <p className="text-gray-400 mt-2">Manage your account and preferences.</p>
      
      <div className="mt-6 space-y-8">
        <AccountSettings />
       
      </div>
    </div>
  );
};

export default Settings;
