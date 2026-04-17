const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffprobePath = require('ffprobe-static').path;
const stream = require('stream');

// Configura o caminho do ffprobe automaticamente
ffmpeg.setFfprobePath(ffprobePath);

/*
 * Converte a string de frame rate do ffmpeg (ex: "30000/1001") em número decimal
 */
const calculateFPS = (fpsString) => {
    if (!fpsString) return 0;
    const parts = fpsString.split('/');
    if (parts.length === 2) {
        return parseFloat(parts[0]) / parseFloat(parts[1]);
    }
    return parseFloat(fpsString);
};

const validateGeneralAsset = async (file) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const size = file.size;
    const sizeMB = size / (1024 * 1024);

    let report = {
        isValid: true,
        errors: [],
        warnings: [],
        metadata: {
            fileName: file.originalname,
            fileSizeMB: sizeMB.toFixed(2)
        }
    };

    // --- 1. VALIDAÇÃO DE NOME ---
    console.log('RAW:', file.originalname);
    console.log('JSON:', JSON.stringify(file.originalname));
    console.log(
        'CHARS:',
        file.originalname.split('').map(c => `${c}(${c.charCodeAt(0)})`).join(' ')
    );

    const nameRegex = /^[a-zA-Z0-9_\-\.~]+$/;

    const cleanName = file.originalname
        .trim()
        .normalize('NFKC');

    const fileNameOnly = cleanName.split('.').slice(0, -1).join('.') || cleanName;

    if (cleanName.includes(' ')) {
        report.errors.push("ERRO: O nome do arquivo não pode conter ESPAÇOS.");
    } else if (!nameRegex.test(fileNameOnly)) {
        report.errors.push("ERRO: Nome inválido (Use apenas a-z, 0-9, _, -, ., ~).");
    }

    // --- 2. EXTRAÇÃO DE METADADOS VIA FFPROBE ---
    const isVideo = ['.mp4', '.mov'].includes(ext);
    const isAudio = ['.mp3', '.m4a', '.ogg', '.aac'].includes(ext);
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext);

    if (isVideo || isAudio) {
        try {
            const data = await new Promise((resolve, reject) => {
                const bufferStream = new stream.PassThrough();
                bufferStream.end(file.buffer);
                ffmpeg(bufferStream).ffprobe((err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });

            const vStream = data.streams.find(s => s.codec_type === 'video');
            const aStream = data.streams.find(s => s.codec_type === 'audio');

            if (vStream) {
                const fps = calculateFPS(vStream.r_frame_rate);
                report.metadata = {
                    ...report.metadata,
                    type: 'video',
                    codec: vStream.codec_name,
                    resolution: `${vStream.width}x${vStream.height}`,
                    fps: fps.toFixed(2),
                    bitrate: data.format.bit_rate ? Math.round(data.format.bit_rate / 1000) + ' kbps' : 'N/A'
                };

                // Validações Técnicas Vídeo
                if (fps > 30) report.errors.push(`ERRO: Frame Rate de ${fps.toFixed(2)} FPS excede o limite IAB (Máx 30).`);
                if (vStream.codec_name !== 'h264') report.warnings.push(`AVISO: Codec detectado: ${vStream.codec_name}. O recomendado para web/anúncios é H.264.`);
            }

            if (aStream) {
                report.metadata.audioCodec = aStream.codec_name;
                report.metadata.sampleRate = aStream.sample_rate + ' Hz';
            }
        } catch (e) {
            report.errors.push("FALHA TÉCNICA: Não foi possível ler os metadados internos do arquivo.");
        }
    }

    // --- 3. REGRAS DE PESO E FORMATO (IAB TECH LAB / PADRÕES) ---

    // Vídeo
    if (isVideo) {

        if (sizeMB > 10) {
            report.errors.push("ERRO: O arquivo bruto excede 10MB (Limite máximo para upload em AdServers Globais).");
        } else if (sizeMB > 2.2) {
            report.warnings.push("AVISO: Vídeo com mais de 2.2MB. Se for para uso 'In-Banner', poderá ser rejeitado por Heavy Ad Intervention.");
        }

        report.warnings.push("VAST: Certifique-se de que o asset é compatível com VAST");
        report.warnings.push("ÁUDIO: Deve estar 'Muted' por padrão na inicialização do player.");
    }

    // Imagem
    if (isImage) {

        // Limite rigoroso de 200KB (0.2MB) para aceitação universal
        if (sizeMB > 0.2) {
            report.errors.push(`ERRO: Imagem com ${sizeMB.toFixed(2)}MB excede o limite de 0.2MB (200KB).`);
        }
        if (ext === '.gif') {
            report.warnings.push("GIF: Verifique se a animação não ultrapassa 30 segundos ou 3 loops.");
        }

    }

    // Áudio
    if (isAudio) {
        if (sizeMB > 1.0) {
            report.errors.push("ERRO: O arquivo de áudio excede 1MB.");
        }
        report.warnings.push("LOUDNESS: Certifique-se de que o alvo é -16 LUFS para evitar rejeição em publishers premium.");
    }

    // --- FINALIZAÇÃO ---
    if (report.errors.length > 0) report.isValid = false;

    return report;
};

module.exports = { validateGeneralAsset };