// FileUploader.js
import React, { useState } from "react";
import { parseVideoFile } from "../utils/videoParser";
import { parseGifFile } from "../utils/gifParser";
import { parseAudioFile } from "../utils/audioParser";
import { validateMedia } from "../utils/validators";
import { getPlatformLink } from "../utils/getPlataformLink";

import VideoPreview from "./MediaPreview/VideoPreview";
import GifPreview from "./MediaPreview/GifPreview";
import AudioPreview from "./MediaPreview/AudioPreview";

import AuditTable from './Layout/AuditTable';

function FileUploader() {
  const [items, setItems] = useState([]);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    const processed = [];

    for (const file of files) {
      let type = null;
      let meta = {};

      try {
        if (file.type.startsWith("video/")) {
          type = "video";
          meta = await parseVideoFile(file);
        } else if (file.type === "image/gif") {
          type = "gif";
          meta = await parseGifFile(file);
        } else if (file.type.startsWith("audio/")) {
          type = "audio";
          meta = await parseAudioFile(file);
        } else {
          continue; // Tipo não suportado
        }
      } catch (err) {
        meta = { name: file.name, error: "Erro ao parsear" };
      }

      const platforms = ["amazon", "dv360", "cm360", "flashtalking", "iab"];
      for (const platform of platforms) {
        const errs = validateMedia(meta, type, platform);
        processed.push({
          file,
          type,
          platform,
          meta,
          validationErrors: errs,
        });
      }
    }

    setItems(processed);
  };

  return (
    <div className="uploader">
      <h2>Upload mídia (vídeo / GIF / áudio)</h2>
      <input
        type="file"
        multiple
        onChange={handleFiles}
        accept="video/*,image/gif,audio/*"
      />
     
    {items.length > 0 && <AuditTable items={items} />}

    </div>
  );
}

export default FileUploader;
