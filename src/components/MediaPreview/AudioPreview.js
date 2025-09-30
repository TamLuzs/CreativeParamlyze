import React, { useState, useEffect } from "react";

function AudioPreview({ file }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!file) return null;

  return (
    <div className="preview audio-preview">
      <audio controls src={url} aria-label={`Player de áudio: ${file.name}`} />
    </div>
  );
}

export default AudioPreview;
