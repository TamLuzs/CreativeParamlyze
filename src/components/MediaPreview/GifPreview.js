import React, { useState, useEffect } from "react";

function GifPreview({ file }) {
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
    <div className="preview gif-preview">
      <img
        src={url}
        alt={`GIF preview: ${file.name}`}
        width="320"
        loading="lazy"
      />
    </div>
  );
}

export default GifPreview;
