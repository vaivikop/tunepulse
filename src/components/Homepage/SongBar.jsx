import Link from "next/link";
import { FaPlayCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import getPixels from "get-pixels";
import { extractColors } from "extract-colors";

const SongBar = ({ playlist, i }) => {
  const [cardColor, setCardColor] = useState();

  useEffect(() => {
    const src = playlist?.image?.[1]?.link;
    getPixels(src, (err, pixels) => {
      if (!err) {
        const data = [...pixels.data];
        const width = Math.round(Math.sqrt(data.length / 4));
        const height = width;

        extractColors({ data, width, height })
          .then((colors) => {
            setCardColor(colors);
          })
          .catch(console.log);
      }
    });
  }, []);

  return (
    <Link href={`/playlist/${playlist?.id}`}>
      <div
        className="w-full flex items-center py-3 px-4 rounded-lg cursor-pointer mb-3"
        style={{
          background:
            cardColor &&
            `linear-gradient(135deg, rgba(${cardColor[0]?.red}, ${cardColor[0]?.green}, ${cardColor[0]?.blue}, 0.25), rgba(${cardColor[1]?.red}, ${cardColor[1]?.green}, ${cardColor[1]?.blue}, 0.15))`,
        }}
      >
        <h3 className="text-lg text-white font-bold mr-4">{i + 1}.</h3>
        <div className="flex-1 flex items-center">
          <img
            src={playlist?.image?.[1]?.link}
            alt="playlist_img"
            className="w-16 h-16 md:w-20 md:h-20 rounded-lg shadow-lg"
          />
          <div className="ml-4 flex-1">
            <p className="font-semibold text-white text-base md:text-lg truncate">
              {playlist?.title}
            </p>
            <p className="text-sm text-gray-300 capitalize mt-1">
              {playlist?.language}
            </p>
          </div>
        </div>
        <FaPlayCircle
          size={40}
          className="text-gray-300 group-hover:text-white group-hover:scale-125 transition-transform duration-300 ease-in-out"
        />
      </div>
    </Link>
  );
};

export default SongBar;
