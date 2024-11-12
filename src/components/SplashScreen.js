// SplashScreen.js
import React from 'react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#020813] z-50">
      <h1 className="text-4xl font-bold text-white">TunePulse</h1>
      {/* Add any loading spinner or logo here */}
    </div>
  );
};

export default SplashScreen;
