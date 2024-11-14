"use client";

import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import "./globals.css";
import MusicPlayer from "@/components/MusicPlayer";
import Providers from "@/redux/Providers";
import TopProgressBar from "@/components/topProgressBar/TopProgressBar";
import Favicon from "./favicon.ico";
import SongsHistory from "@/components/SongsHistory";
import { Toaster } from "react-hot-toast";
import AuthProvider from "./AuthProvider";
import { Poppins } from "next/font/google";
import Script from "next/script";
import SplashScreen from "@/components/SplashScreen";
import { metadata } from "./metadata"; // Import metadata

const poppins = Poppins({
  weight: "500",
  subsets: ["latin-ext"],
  display: "swap",
});

export default function RootLayout({ children }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-Z4FJ5T627Q"
      ></Script>
      <Script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-Z4FJ5T627Q');
        `}
      </Script>
      <body className={poppins.className}>
        {showSplash ? (
          <SplashScreen />
        ) : (
          <Providers>
            <AuthProvider>
              <TopProgressBar />
              <SongsHistory />
              <Navbar />
              <Toaster />
              {children}
              <div className="h-20"></div>
              <div className="fixed bottom-0 left-0 right-0 flex backdrop-blur-lg rounded-t-3 z-50">
                <MusicPlayer />
              </div>
            </AuthProvider>
          </Providers>
        )}
      </body>
    </html>
  );
}