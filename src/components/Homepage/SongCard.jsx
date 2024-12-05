"use client";
import React, { memo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import PlayPause from "../PlayPause";
import {
  playPause,
  setActiveSong,
  setFullScreen,
} from "../../redux/features/playerSlice";
import { getRecommendedSongs, getSongData } from "@/services/dataAPI";

const SongCard = ({ song, isPlaying, activeSong }) => {
  const [loading, setLoading] = useState(false);
  const { currentSongs, autoAdd } = useSelector((state) => state.player);

  const dispatch = useDispatch();

  const handlePauseClick = () => {
    if (song?.type === "song") {
      dispatch(playPause(false));
    }
  };

  const handlePlayClick = async () => {
    if (song?.type === "song") {
      setLoading(true);
      const Data = await getSongData(song?.id);
      const songData = await Data?.[0];
      const recommendedSongs = await getRecommendedSongs(
        songData?.primaryArtistsId,
        songData?.id
      );

      const filteredRecommendedSongs =
        recommendedSongs?.filter(
          (song) => !currentSongs?.find((s) => s?.id === song?.id)
        ) || [];
      dispatch(
        setActiveSong({
          song: songData,
          data: currentSongs?.find((s) => s?.id === songData?.id)
            ? currentSongs
            : autoAdd
            ? [...currentSongs, songData, ...filteredRecommendedSongs]
            : [...currentSongs, songData],
          i: currentSongs?.find((s) => s?.id === songData?.id)
            ? currentSongs?.findIndex((s) => s?.id === songData?.id)
            : currentSongs?.length,
        })
      );
      dispatch(setFullScreen(true));
      dispatch(playPause(true));
      setLoading(false);
    }
  };

  return (
    <div
      key={song?.id}
      className="flex flex-col w-full max-w-[300px] sm:max-w-[240px] md:max-w-[200px] p-3 bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl shadow-lg cursor-pointer"
    >
      <Link
        onClick={(e) => {
          if (song?.type === "song") {
            e.preventDefault();
          }
        }}
        href={
          song?.type === "album"
            ? `/album/${song?.id}`
            : song?.type === "playlist"
            ? `/playlist/${song?.id}`
            : ""
        }
      >
        <div className="relative w-full h-[200px] group overflow-hidden rounded-lg">
          <img
            width={200}
            height={200}
            loading="lazy"
            alt="song_img"
            srcSet={`${song.image?.[0]?.url || song.image?.[0]?.link} 320w, ${
              song.image?.[1]?.url || song.image?.[1]?.link
            } 480w, ${song.image?.[2]?.url || song.image?.[2]?.link} 800w`}
            sizes="(max-width: 320px) 280px, (max-width: 480px) 440px, 800px"
            src={song.image?.[1]?.url || song.image?.[1]?.link}
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
          />
          <div
            className={`absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              activeSong?.id === song?.id ? "opacity-100" : ""
            }`}
          >
            <PlayPause
              isPlaying={isPlaying}
              activeSong={activeSong}
              song={song}
              loading={loading}
              handlePause={handlePauseClick}
              handlePlay={handlePlayClick}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="font-semibold text-sm text-white truncate w-full">
            {song?.name?.replaceAll("&#039;", "'")?.replaceAll("&amp;", "&") ||
              song?.title}
          </p>
          <p className="text-xs text-gray-400 mt-1 truncate">
            {song?.artists?.primary?.map((artist) => artist?.name).join(", ") ||
              song?.artists?.map((artist) => artist?.name).join(", ") ||
              (song?.subtitle != "JioSaavn" && song?.subtitle)}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default memo(
  SongCard,
  (prev, next) =>
    prev.song === next.song &&
    prev.activeSong === next.activeSong &&
    prev.isPlaying === next.isPlaying
);
