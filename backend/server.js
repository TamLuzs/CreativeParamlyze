const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip'); 
const { validateHTML5 } = require('./validators/html5Validator');
const { validateGeneralAsset } = require('./validators/assetValidator');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração de armazenamento em memória para o Multer
const upload = multer({ storage: multer.memoryStorage() });

// Garante que a pasta de previews exista
const PREVIEW_BASE_DIR = path.join(__dirname, 'temp_previews');
if (!fs.existsSync(PREVIEW_BASE_DIR)) {
    fs.mkdirSync(PREVIEW_BASE_DIR, { recursive: true });
}

// Rota para servir o preview estático
app.use('/previews', express.static(PREVIEW_BASE_DIR));

app.post('/api/audit', upload.single('asset'), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    const ext = path.extname(file.originalname).toLowerCase();
    let finalReport;
    let previewUrl = null;

    try {
        if (ext === '.zip') {
            // 1. Validação do HTML5
            finalReport = await validateHTML5(file.buffer, file.size);

            // 2. Lógica de Extração para Preview
            const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extractPath = path.join(PREVIEW_BASE_DIR, uniqueId);
            
            const zip = new AdmZip(file.buffer);
            zip.extractAllTo(extractPath, true);

            // Define a URL para o frontend acessar (ajuste conforme seu domínio)
            previewUrl = `http://localhost:3001/previews/${uniqueId}/index.html`;
        } else {
            finalReport = await validateGeneralAsset(file);
        }

        res.json({
            fileName: file.originalname,
            fileSize: (file.size / 1024).toFixed(2) + ' KB',
            compliance: "IAB Tech Lab 2024-2026 / DSP Standard",
            timestamp: new Date().toISOString(),
            previewUrl: previewUrl, 
            ...finalReport
        });

    } catch (error) {
        console.error("Erro no processamento:", error);
        res.status(500).json({ error: "Erro interno no processamento do arquivo." });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`✅ Servidor de Auditoria rodando na porta ${PORT}`);
});