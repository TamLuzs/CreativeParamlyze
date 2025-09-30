// src/utils/validators.js

/**
 * --- Validações auxiliares gerais ---
 */

/**
 * Valida nome de arquivo / asset name conforme normas (latim alfanumérico + -._~, até 250 caracteres)
 * @param name — string (file.name ou asset name)
 * @returns array de erros de nome
 */
function validateFileName(name) {
  const errs = [];
  if (!name) {
    errs.push("Nome do arquivo ausente");
    return errs;
  }
  if (name.length > 250) {
    errs.push(`Nome do arquivo muito longo (${name.length} caracteres, máximo 250)`);
  }
  // Regex para permitir letras latinas + dígitos + - . _ ~
  // Você pode ajustar se quiser permitir til (~) ou acentos específicos. Aqui só latim básico.
  const re = /^[A-Za-z0-9\-\._~]+$/;
  // Se quiser permitir extensão (ex: name.gif), pode separar nome base + extensão
  const base = name.includes(".") ? name.substring(0, name.lastIndexOf(".")) : name;
  if (!re.test(base)) {
    errs.push(`Nome de arquivo "${base}" contém caracteres inválidos. Permitido: latim alfanumérico, - . _ ~`);
  }
  return errs;
}

/**
 * Concatena validadores de diferentes níveis (geral + plataforma)
 */
function combineValidators(generalFn, platformFnsMap) {
  return (meta, platform) => {
    let errs = [];
    errs = errs.concat(generalFn(meta));
    const platformFn = platformFnsMap[platform];
    if (platformFn) {
      errs = errs.concat(platformFn(meta));
    }
    return errs;
  };
}

/* ========== VALIDAÇÃO DE VÍDEO ========== */

function validateVideoGeneral(meta) {
  const errs = [];

  // Nome do arquivo
  errs.push(...validateFileName(meta.name));

  // Tamanho máximo (Flashtalking permitem até 512 MB)
  if (meta.size != null && meta.size > 512 * 1024 * 1024) {
    errs.push("Arquivo muito grande (maior que 512 MB)");
  }

  // Duração máxima permitida (Flashtalking: 900 s)
  if (meta.duration != null && meta.duration > 900) {
    errs.push("Vídeo mais longo que 900 segundos (máximo Flashtalking)");
  }
  if (meta.duration != null && meta.duration <= 0) {
    errs.push("Duração inválida (menor ou igual a zero)");
  }

  // Resolução / proporção
  if (meta.width != null && meta.height != null) {
    const ar = (meta.width / meta.height).toFixed(2);
    if (!(ar === "1.78" || ar === "1.33")) {
      errs.push(`Aspect ratio (${ar}) não é 16:9 nem 4:3`);
    }
  }

  // Frame rate
  if (meta.frameRate != null) {
    const fr = meta.frameRate;
    const allowed = [23.98, 23.976, 24, 25, 29.97, 30];
    const matches = allowed.some(a => Math.abs(fr - a) < 0.01);
    if (!matches) {
      errs.push(`Frame rate (${fr}) fora dos padrões aceitos: ${allowed.join(", ")}`);
    }
  }

  // Codec de vídeo
  if (meta.codec) {
    const accepted = [
      "H.261", "H.263", "H.264", "AVC", "mpeg4",
      "Motion JPEG A", "Motion JPEG B",
      "Apple Animation", "Apple Pro Res"
    ];
    const ok = accepted.some(a => meta.codec.toLowerCase().includes(a.toLowerCase()));
    if (!ok) {
      errs.push(`Codec de vídeo (${meta.codec}) não é aceitável`);
    }
  }

  // Tipo de varredura (scanType) — não permitir interlaced
  if (meta.scanType && meta.scanType.toLowerCase().includes("interlaced")) {
    errs.push("Vídeo entrelaçado (interlaced) não é permitido");
  }

  return errs;
}

function validateVideo_Flashtalking(meta) {
  const errs = [];

  // Bitrate total
  if (meta.overallBitRate != null) {
    const mbps = meta.overallBitRate / 1_000_000;
    if (mbps < 15 || mbps > 30) {
      errs.push(`Bitrate fora da faixa Flashtalking (15–30 Mbps): ${mbps.toFixed(2)} Mbps`);
    }
  }

  // Container / tipo MIME
  if (meta.mimeType) {
    const mime = meta.mimeType.toLowerCase();
    if (!(mime === "video/mp4" || mime === "video/quicktime" || meta.name.toLowerCase().endsWith(".mov"))) {
      errs.push(`Formato (${meta.mimeType}) não é .mp4 ou .mov aceitável para Flashtalking`);
    }
  }

  return errs;
}

function validateVideo_Amazon(meta) {
  const errs = [];

  // Duração mínima / máxima (ex: 6s até 120s para alguns formatos)
  if (meta.duration != null) {
    if (meta.duration < 6) {
      errs.push("Duração menor que 6 segundos (Amazon mínimo)");
    }
    if (meta.duration > 120) {
      errs.push("Duração maior que 120 segundos para Amazon OLV");
    }
  }

  // Tamanho
  if (meta.size != null && meta.size > 500 * 1024 * 1024) {
    errs.push("Arquivo maior que 500 MB (limite Amazon)");
  }

  // Bitrate total mínimo
  if (meta.overallBitRate != null) {
    const mbps = meta.overallBitRate / 1_000_000;
    if (mbps < 1) {
      errs.push("Bitrate abaixo de 1 Mbps (Amazon exige mínimo)");
    }
  }

  // Áudio
  if (meta.audioBitRate != null) {
    const kbps = meta.audioBitRate / 1000;
    if (kbps < 96) {
      errs.push(`Bitrate de áudio (${kbps.toFixed(1)} kbps) menor que mínimo 96 kbps (Amazon)`);
    }
  }
  if (meta.audioSampleRate != null && meta.audioSampleRate < 44100) {
    errs.push(`Taxa de amostragem de áudio (${meta.audioSampleRate} Hz) menor que 44.1 kHz (Amazon)`);
  }

  return errs;
}

function validateVideo_DV360(meta) {
  const errs = [];

  // Bitrate recomendado mínimo para vídeo HD
  if (meta.overallBitRate != null) {
    const mbps = meta.overallBitRate / 1_000_000;
    if (mbps < 2.5) {
      errs.push(`Bitrate (${mbps.toFixed(2)} Mbps) abaixo do recomendado para vídeo HD em DV360`);
    }
  }

  return errs;
}

function validateVideo_IAB(meta) {
  const errs = [];

  // IAB não costuma permitir interlacing
  if (meta.scanType && meta.scanType.toLowerCase().includes("interlaced")) {
    errs.push("Vídeo entrelaçado não compatível com guideline IAB");
  }

  return errs;
}

const validateVideoForPlatform = combineValidators(
  validateVideoGeneral,
  {
    flashtalking: validateVideo_Flashtalking,
    amazon: validateVideo_Amazon,
    dv360: validateVideo_DV360,
    cm360: validateVideo_DV360,
    iab: validateVideo_IAB,
  }
);

/* ========== VALIDAÇÃO DE GIF ========== */

function validateGifGeneral(meta) {
  const errs = [];

  errs.push(...validateFileName(meta.name));

  if (!(meta.type && meta.type.toLowerCase().includes("gif"))) {
    errs.push("Arquivo não é GIF");
  }

  if (meta.size != null && meta.size > 10 * 1024 * 1024) {
    errs.push("GIF maior que 10 MB");
  }

  if (meta.duration != null && meta.duration > 30) {
    errs.push(`Duração maior que 30s recomendada para GIF: ${meta.duration.toFixed(2)}s`);
  }

  if (meta.loopCount != null && meta.loopCount > 3) {
    errs.push(`Loops maior que 3: loopCount = ${meta.loopCount}`);
  }

  if (meta.framesCount != null && meta.framesCount > 200) {
    errs.push(`Número de frames alto: ${meta.framesCount} frames (pode causar peso elevado)`);
  }

  return errs;
}

function validateGif_Flashtalking(meta) {
  const errs = [];
  // reforçar que tipo seja gif
  if (meta.type && !meta.type.toLowerCase().includes("gif")) {
    errs.push("Flashtalking exige formato GIF para este asset");
  }
  return errs;
}

function validateGif_Amazon(meta) {
  const errs = [];

  // sugestão de limite para banners (1 MB ou abaixo)
  if (meta.size != null && meta.size > 1 * 1024 * 1024) {
    errs.push("Amazon recomenda GIFs menores (ex: <1 MB) para banners");
  }
  if (meta.loopCount != null && meta.loopCount > 3) {
    errs.push("Amazon pode rejeitar GIFs com mais de 3 loops");
  }
  if (meta.duration != null && meta.duration > 30) {
    errs.push("Amazon pode rejeitar GIFs com duração >30s");
  }

  return errs;
}

function validateGif_IAB(meta) {
  const errs = [];

  if (meta.loopCount != null && meta.loopCount > 3) {
    errs.push("IAB exige máximo 3 loops para GIF animado");
  }
  if (meta.duration != null && meta.duration > 30) {
    errs.push("IAB recomenda GIF animados com duração ≤30s");
  }

  return errs;
}

const validateGifForPlatform = combineValidators(
  validateGifGeneral,
  {
    flashtalking: validateGif_Flashtalking,
    amazon: validateGif_Amazon,
    dv360: validateGif_IAB,
    cm360: validateGif_IAB,
    iab: validateGif_IAB,
  }
);

/* ========== VALIDAÇÃO DE ÁUDIO ========== */

function validateAudioGeneral(meta) {
  const errs = [];

  errs.push(...validateFileName(meta.name));

  if (meta.duration == null) {
    errs.push("Duração não encontrada");
  } else if (meta.duration < 1) {
    errs.push("Duração menor que 1 segundo");
  }

  if (meta.size != null && meta.size > 100 * 1024 * 1024) {
    errs.push("Arquivo maior que 100 MB");
  }

  if (meta.sampleRate != null && meta.sampleRate < 44100) {
    errs.push(`Taxa de amostragem (${meta.sampleRate} Hz) menor que 44.1 kHz`);
  }

  if (meta.audioBitRate != null) {
    const kbps = meta.audioBitRate / 1000;
    if (kbps < 192) {
      errs.push(`Bitrate de áudio (${kbps.toFixed(1)} kbps) menor que 192 kbps`);
    }
  }

  if (meta.loudnessIntegrated != null) {
    if (Math.abs(meta.loudnessIntegrated + 16) > 1.5) {
      errs.push(`Loudness integrado (${meta.loudnessIntegrated.toFixed(2)} LUFS) fora de ‐16 ± 1.5 LUFS`);
    }
  } else {
    errs.push("Loudness não disponível");
  }

  if (meta.truePeak != null) {
    if (meta.truePeak > -2.0) {
      errs.push(`True Peak (${meta.truePeak} dBTP) acima de ‐2.0 dBTP`);
    }
  }

  return errs;
}

function validateAudio_Flashtalking(meta) {
  const errs = [];
  const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/ogg", "audio/m4a", "audio/aac"];
  if (meta.type) {
    const t = meta.type.toLowerCase();
    if (!allowedTypes.some(a => t.includes(a))) {
      errs.push(`Tipo de áudio (${meta.type}) não permitido em Flashtalking`);
    }
  }
  return errs;
}

function validateAudio_Amazon(meta) {
  const errs = [];
  if (meta.duration != null) {
    if (meta.duration < 10) {
      errs.push("Duração menor que 10s para Amazon Audio Ads");
    }
    if (meta.duration > 30) {
      errs.push("Duração maior que 30s para Amazon Audio Ads");
    }
  }
  if (meta.size != null && meta.size > 3 * 1024 * 1024) {
    errs.push("Arquivo maior que 3 MB (limite Amazon Audio Ads)");
  }
  return errs;
}

function validateAudio_Programmatic(meta) {
  const errs = [];
  if (meta.type) {
    const t = meta.type.toLowerCase();
    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/ogg", "audio/wav"];
    if (!allowedTypes.some(a => t.includes(a))) {
      errs.push(`Formato de áudio (${meta.type}) possivelmente não aceitável para plataformas programáticas`);
    }
  }
  return errs;
}

const validateAudioForPlatform = combineValidators(
  validateAudioGeneral,
  {
    flashtalking: validateAudio_Flashtalking,
    amazon: validateAudio_Amazon,
    programmatic: validateAudio_Programmatic,
    iab: () => []  // se não houver regra específica para IAB áudio
  }
);

/**
 * Função geral que escolhe validator conforme tipo
 * @param meta — metadados
 * @param type — "video" | "gif" | "audio"
 * @param platform — string de plataforma
 * @returns array de erros (strings)
 */
export function validateMedia(meta, type, platform) {
  if (type === "video") {
    return validateVideoForPlatform(meta, platform);
  }
  if (type === "gif") {
    return validateGifForPlatform(meta, platform);
  }
  if (type === "audio") {
    return validateAudioForPlatform(meta, platform);
  }
  return [`Tipo desconhecido "${type}"`];
}
