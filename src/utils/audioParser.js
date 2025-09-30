// src/utils/audioParser.js

import MediaInfoFactory from "mediainfo.js";
import { LoudnessMeter } from "@domchristie/needles";

/**
 * Extrai metadados de áudio, incluindo loudness (LUFS) e true peak, se disponível.
 * @param {File} file - Arquivo de áudio
 * @returns {Promise<Object>} - Metadados do áudio
 */
export async function parseAudioFile(file) {
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

  const miResult = await mediaInfo.analyzeData(getSize, readChunk);
  const tracks = miResult.media?.track || [];

  const general = tracks.find(t => t["@type"] === "General");
  const audioTrack = tracks.find(t => t["@type"] === "Audio");

  const parseNumber = (val) => {
    const num = parseFloat(val);
    return Number.isNaN(num) ? null : num;
  };

  // 2. Web Audio API: decodificar e medir
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  let audioBuffer;

  try {
    // Pode ser Promise ou usar callback (antigo)
    audioBuffer = await new Promise((resolve, reject) => {
      const result = audioCtx.decodeAudioData.length === 1
        ? audioCtx.decodeAudioData(arrayBuffer, resolve, reject)
        : audioCtx.decodeAudioData(arrayBuffer).then(resolve).catch(reject);
    });
  } catch (err) {
    console.error("Erro ao decodificar áudio:", err);
    await audioCtx.close();
    throw err;
  }

  const duration = audioBuffer.duration;
  const sampleRate = audioBuffer.sampleRate;
  const channels = audioBuffer.numberOfChannels;

  // 3. Bitrate estimado (fallback se não vier de MediaInfo)
  let audioBitRate = null;
  if (audioTrack?.BitRate) {
    audioBitRate = parseNumber(audioTrack.BitRate); // em bits/s
  } else if (duration > 0) {
    audioBitRate = (file.size * 8) / duration; // estimativa em bits/s
  }

  // 4. Medição de loudness via Needles
  const loudnessResult = await new Promise((resolve, reject) => {
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;

    let meter;

    try {
      meter = new LoudnessMeter({
        source,
        modes: ["integrated"],
        workerUri: "/needles-worker.js", // ou ajuste conforme sua estrutura
      });
    } catch (e) {
      console.error("Erro ao criar LoudnessMeter:", e);
      reject(e);
      return;
    }

    source.connect(meter.input);
    meter.connect(audioCtx.destination);

    meter.on("dataavailable", (ev) => {
      resolve({
        loudnessIntegrated: ev.data?.integrated ?? null,
        truePeak: ev.data?.truePeak ?? null,
      });
    });

    meter.on("error", reject);

    source.start();
    meter.start();
  });

  await audioCtx.close();

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    duration,
    sampleRate,
    channels,
    audioBitRate,
    loudnessIntegrated: loudnessResult.loudnessIntegrated,
    truePeak: loudnessResult.truePeak,

    // MediaInfo
    format: general?.Format || null,
    audioCodec: audioTrack?.Format || null,
  };
}
