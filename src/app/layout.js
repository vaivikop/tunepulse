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

const poppins = Poppins({
  weight: "500",
  subsets: ["latin-ext"],
  display: "swap",
});

export const metadata = {
  title: "TunePulse - Your Personalized Music Experience",
  description: "TunePulse - A music streaming app designed to deliver the best music experience with curated playlists, song history, and seamless playback. Created by Vaivik Shah.",
  image: "https://res.cloudinary.com/dbr73rpz9/image/upload/v1690380865/images/logo-color_noktgr.png",
  url: "https://tunepulse.vercel.app",
  type: "website",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  site_name: "TunePulse",
  manifest: "/manifest.json",
  author: "Vaivik Shah",
  "og:title": "TunePulse - Your Personalized Music Experience",
  "og:description": "TunePulse - The ultimate music streaming platform created by Vaivik Shah, offering curated playlists and seamless playback.",
  "og:image": "https://res.cloudinary.com/dbr73rpz9/image/upload/v1690380865/images/logo-color_noktgr.png",
  "og:url": "https://tunepulse.vercel.app",
  "og:type": "website",
  "og:site_name": "TunePulse",
  keywords: "music streaming, playlists, audio player, songs history, TunePulse, Vaivik Shah",
  "theme-color": "#1DB954",
  "apple-touch-icon": [
    { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" }
  ],
  "favicon": [
    { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
    { rel: "icon", href: "/favicon.ico" }
  ],
};

export default function RootLayout({ children }) {
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
        <Providers>
          <AuthProvider>
            <TopProgressBar />
            <SongsHistory />
            <Navbar />
            <Toaster />
            {children}
            <div className="h-20"></div>
            <div className="fixed  bottom-0 left-0 right-0 flex backdrop-blur-lg rounded-t-3 z-50">
              <MusicPlayer />
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
