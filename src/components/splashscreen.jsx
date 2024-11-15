"use client";  // Add this line to mark it as a Client Component

import { useEffect, useState } from "react";
import anime from "animejs";

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Logo animation
    anime({
      targets: ".splash-logo",
      opacity: [0, 1],
      scale: [0.6, 1],
      duration: 2000, // Increased duration
      easing: "easeOutQuad",
      delay: 500,
    });

    // Website name animation
    anime({
      targets: ".website-name",
      opacity: [0, 1],
      translateY: [50, 0],
      duration: 1500, // Increased duration
      easing: "easeOutQuad",
      delay: 1500, // Adjusted delay to make it appear later
    });

    // "Brought to you by" animation
    anime({
      targets: ".credits",
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 1200, // Increased duration
      easing: "easeOutQuad",
      delay: 2500, // Adjusted delay to make it appear after the website name
      complete: () => setIsVisible(false),
    });
  }, []);

  if (!isVisible) return null;

  return (
    <div className="splash-screen fixed inset-0 flex flex-col justify-center items-center z-50 bg-transparent">
      {/* Logo */}
      <img
        src="https://res.cloudinary.com/dgrxq7vm5/image/upload/v1731651165/hebakdcgeai3uutryoyk.png"
        alt="TunePulse Logo"
        className="splash-logo w-36 h-36 mb-4"
      />
      {/* Website Name */}
      <h1 className="website-name text-white text-4xl font-bold opacity-0 mb-2">
        TunePulse
      </h1>
      {/* Credits */}
      <p className="credits text-white opacity-0 text-xl">
        Brought to you by Vaivik Shah
      </p>
    </div>
  );
};

export default SplashScreen;
