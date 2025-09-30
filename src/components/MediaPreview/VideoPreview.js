import React, { useState, useEffect } from "react";

function VideoPreview({ file }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    // Cleanup: liberar URL ao desmontar ou trocar o arquivo
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!file) return null;

  return (
    <div className="preview video-preview">
      <video
        width="320"
        controls
        src={url}
        aria-label={`Visualização do vídeo: ${file.name}`}
      />
    </div>
  );
}

export default VideoPreview;
