// src/utils/gifParser.js

import { parseGIF, decompressFrames } from "gifuct-js";

/**
 * Extrai metadados de um arquivo GIF, incluindo frames, duração, e loop.
 * @param {File} file - Arquivo de imagem GIF
 * @returns {Promise<Object>} - Metadados do GIF
 */
export async function parseGifFile(file) {
  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);

  let gif;
  let frames = [];

  try {
    gif = parseGIF(uint8);
    frames = decompressFrames(gif, true);
  } catch (err) {
    console.error("Erro ao parsear GIF:", err);
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      error: "Erro ao processar o GIF",
    };
  }

  // Calcular duração total em segundos
  let duration = 0;
  frames.forEach(frame => {
    duration += (frame.delay || 0) * 0.01; // delay em centésimos de segundo
  });

  // Tentar extrair loopCount
  let loopCount = null;

  try {
    if (gif.application?.loopCount != null) {
      loopCount = gif.application.loopCount;
    } else if (gif.extensions) {
      const netscapeExt = gif.extensions.find(
        ext => ext.label === 0xFF && ext.application === "NETSCAPE"
      );
      if (netscapeExt?.loopCount != null) {
        loopCount = netscapeExt.loopCount;
      }
    }
  } catch (e) {
    // Silenciosamente ignora se não conseguir extrair loopCount
    loopCount = null;
  }

  // Largura/altura do primeiro frame
  let width = null;
  let height = null;
  if (frames[0]?.dims) {
    width = frames[0].dims.width;
    height = frames[0].dims.height;
  }

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    framesCount: frames.length,
    duration,      // em segundos
    loopCount,     // null ou 0 se não definido
    width,
    height,
  };
}
