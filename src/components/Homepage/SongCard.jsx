"use client";
import React, { memo, useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import PlayPause from "../PlayPause";
import {
  playPause,
  setActiveSong,
  setFullScreen,
} from "../../redux/features/playerSlice";
import { getRecommendedSongs, getSongData } from "@/services/dataAPI";
import { useSelector } from "react-redux";

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
      // remove duplicate songs in recommendedSongs array and currentSongs array
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
      className="flex flex-col w-[220px] p-4 bg-white/5 bg-opacity-80 backdrop-blur-sm rounded-xl shadow-md cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
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
        <div className="relative w-full h-[200px] group">
          <div
            className={`absolute inset-0 flex justify-center items-center bg-black bg-opacity-40 rounded-lg group-hover:flex ${
              activeSong?.id === song?.id
                ? "hover:flex hover:bg-black hover:bg-opacity-70"
                : "hidden"
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
            className={`rounded-lg shadow-xl w-full h-full object-cover transition-transform duration-300 ease-in-out`}
          />
        </div>

        <div className="mt-3 flex flex-col">
          <p
            className={`font-semibold text-sm text-white truncate w-full ${
              song?.subtitle === "JioSaavn" ? "text-center" : ""
            }`}
          >
            {song?.name?.replaceAll("&#039;", "'")?.replaceAll("&amp;", "&") ||
              song?.title}
          </p>
          <p className="text-xs text-gray-200 mt-1">
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
