import React from "react";

interface HeaderProps {
  songTitle?: string;
  songAuthor?: string;
}

export const Header: React.FC<HeaderProps> = ({ songTitle, songAuthor }) => {
  return (
    <div className="header">
      <h1 className="title">
        <img className="logo" src="https://better-lyrics.boidu.dev/icon-512.png" />
        Better Lyrics Shaders
      </h1>
      {songTitle && (
        <div className="song-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M2 10v3m4-7v11m4-14v18m4-13v7m4-10v13m4-8v3"
            />
          </svg>
          {songTitle}
          {songAuthor && ` - ${songAuthor}`}
        </div>
      )}
    </div>
  );
};
