import React, { useState, useEffect } from "react";
import {
  BsFillVolumeUpFill,
  BsVolumeDownFill,
  BsFillVolumeMuteFill,
} from "react-icons/bs";
import { BiAddToQueue, BiShareAlt } from "react-icons/bi"; // Import share icon
import { addSongToPlaylist, getUserPlaylists } from "@/services/playlistApi";
import { toast } from "react-hot-toast";

const VolumeBar = ({
  value,
  min,
  max,
  onChange,
  setVolume,
  activeSong,
  bgColor,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false); // State to control modal visibility

  useEffect(() => {
    const getPlaylists = async () => {
      const res = await getUserPlaylists();
      if (res?.success === true) {
        setPlaylists(res?.data?.playlists);
      }
    };
    getPlaylists();
  }, []);

  // Function to add song to playlist
  const handleAddToPlaylist = async (song, playlistID) => {
    setShowMenu(false);
    const res = await addSongToPlaylist(playlistID, song);
    if (res?.success === true) {
      toast.success(res?.message);
    } else {
      toast.error(res?.message);
    }
  };

  // Function to handle sharing
  const handleShare = () => {
    const shareData = {
      title: activeSong?.name || "Song",
      text: `Check out this song: ${activeSong?.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .then(() => toast.success("Song shared successfully"))
        .catch((error) => toast.error("Error sharing song"));
    } else {
      setShowShareModal(true); // Show custom modal if Web Share API is unavailable
    }
  };

  // Function to copy link to clipboard
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard!");
      setShowShareModal(false); // Close modal after copying
    });
  };

  return (
    <>
      <div className="hidden lg:flex flex-1 items-center justify-end">
        {/* Share Button */}
        <BiShareAlt
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          title="Share Song"
          size={25}
          color={"white"}
          className="cursor-pointer m-1" // Reduced margin
        />

        {/* Add to Playlist Button */}
        <div className="relative">
          <BiAddToQueue
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            title="Add to Playlist"
            size={25}
            color={"white"}
            className="cursor-pointer m-1" // Reduced margin
          />
          {showMenu && (
            <div
              onClick={() => setShowMenu(false)}
              className="absolute text-white bottom-[130%] backdrop-blur-lg rounded-lg p-3 w-32 flex flex-col gap-2 z-[100]"
              style={{
                backgroundColor: bgColor
                  ? `rgba(${bgColor.red}, ${bgColor.green}, ${bgColor.blue}, 0.3)`
                  : "rgba(0,0,0,0.2)",
                backdropFilter: "blur(20px)",
              }}
            >
              <p className="text-sm font-semibold flex gap-1 border-b border-white items-center">
                Add to Playlist
              </p>
              {playlists?.length > 0 ? (
                playlists?.map((playlist, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToPlaylist(activeSong?.id, playlist._id);
                    }}
                    className="text-sm font-semibold flex gap-1 items-center hover:underline"
                  >
                    {playlist?.name}
                  </button>
                ))
              ) : (
                <p className="text-sm font-semibold flex gap-1 items-center">
                  No Playlist
                </p>
              )}
            </div>
          )}
        </div>

        {/* Volume Controls */}
        {value <= 1 && value > 0.5 && (
          <BsFillVolumeUpFill
            size={25}
            color="#FFF"
            className="cursor-pointer"
            onClick={() => setVolume(0)}
          />
        )}
        {value <= 0.5 && value > 0 && (
          <BsVolumeDownFill
            size={25}
            className="cursor-pointer"
            color="#FFF"
            onClick={() => setVolume(0)}
          />
        )}
        {value === 0 && (
          <BsFillVolumeMuteFill
            size={25}
            color="#FFF"
            className="cursor-pointer"
            onClick={() => setVolume(1)}
          />
        )}
        <input
          onClick={(event) => {
            event.stopPropagation();
          }}
          type="range"
          step="any"
          value={value}
          min={min}
          max={max}
          onChange={onChange}
          className="2xl:w-24 lg:w-24 md:w-28 h-1 ml-2 accent-[#00e6e6] cursor-pointer"
        />
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowShareModal(false); // Close the modal if clicked outside
          }}
          className="absolute w-screen h-screen bottom-0 left-0 bg-black opacity-50 z-[50]"
        >
          <div
            onClick={(e) => e.stopPropagation()} // Prevent modal closing when interacting
            className="absolute bg-white p-4 rounded-lg w-72 left-1/2 transform -translate-x-1/2 top-1/4 z-[100]"
          >
            <h3 className="text-center text-lg font-semibold mb-4">Share this Song</h3>
            <button
              onClick={handleCopyLink}
              className="w-full text-center bg-blue-500 text-white p-2 rounded-lg"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default VolumeBar;
