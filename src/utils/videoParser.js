// src/utils/videoParser.js

import MediaInfoFactory from "mediainfo.js";

/**
 * Extrai metadados relevantes de um arquivo de vídeo usando MediaInfo.js
 * @param {File} file - Arquivo de vídeo (File API do navegador)
 * @returns {Promise<Object>} Metadados extraídos do vídeo
 */
export async function parseVideoFile(file) {
  const mediaInfo = await MediaInfoFactory({
    format: "object",
    locateFile: () => "/mediainfo/MediaInfoModule.wasm",
  });



  const getSize = () => file.size;

  const readChunk = (offset, length) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      const blob = file.slice(offset, offset + length);
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(new Uint8Array(e.target.result));
        } else {
          reject(new Error("Erro ao ler chunk do arquivo"));
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(blob);
    });

  const result = await mediaInfo.analyzeData(getSize, readChunk);
  const tracks = result.media?.track || [];

  const general = tracks.find(t => t["@type"] === "General");
  const videoTrack = tracks.find(t => t["@type"] === "Video");
  const audioTrack = tracks.find(t => t["@type"] === "Audio");

  const parseNumber = (val) => {
    const num = parseFloat(val);
    return Number.isNaN(num) ? null : num;
  };

  const parseIntSafe = (val) => {
    const num = parseInt(val, 10);
    return Number.isNaN(num) ? null : num;
  };

  const metadata = {
    name: file.name,
    size: file.size,
    mimeType: file.type,

    // Geral
    format: general?.Format || null,
    overallBitRate: parseNumber(general?.OverallBitRate),
    duration: parseNumber(general?.Duration),

    // Vídeo
    width: parseIntSafe(videoTrack?.Width),
    height: parseIntSafe(videoTrack?.Height),
    frameRate: parseNumber(videoTrack?.FrameRate),
    codec: videoTrack?.Format || null,
    scanType: videoTrack?.ScanType || null,
    bitRate_Video: parseNumber(videoTrack?.BitRate),

    // Áudio
    audioCodec: audioTrack?.Format || null,
    audioChannels: parseIntSafe(audioTrack?.Channels),
    audioBitRate: parseNumber(audioTrack?.BitRate),
    audioSampleRate: parseIntSafe(audioTrack?.SamplingRate),
  };

  return metadata;
}
