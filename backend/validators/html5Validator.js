const AdmZip = require('adm-zip');
const { validateAssets } = require('./assetValidator');

const validateHTML5 = (fileBuffer, fileSize) => {
    let zip;
    try {
        // Proteção contra arquivos corrompidos
        zip = new AdmZip(fileBuffer);
    } catch (err) {
        return { isValid: false, errors: ["Arquivo ZIP inválido ou corrompido."], warnings: [], category: 'Standard' };
    }

    const zipEntries = zip.getEntries();
    const fileSizeKB = fileSize / 1024;

    let report = {
        isValid: true,
        errors: [],
        warnings: [],
        category: fileSizeKB > 200 ? 'RichMedia' : 'Standard',
        network: { count: 0, urls: [], isOverLimit: false }
    };

    // --- 1. VALIDAÇÃO DE PONTO DE ENTRADA (INDEX) ---
    // Ajustado para ser insensível a maiúsculas (index.html vs INDEX.HTML)
    const indexEntry = zipEntries.find(e => e.entryName.toLowerCase() === 'index.html');

    if (!indexEntry) {
        report.isValid = false;
        report.errors.push("ERRO CRÍTICO: 'index.html' não encontrado na raiz. O AdServer não saberá qual arquivo renderizar.");
    } else {
        const indexContent = indexEntry.getData().toString('utf8');

        // Validação de API no HEAD (Obrigatório Global)
        const hasScriptInHead = /<head>[\s\S]*<script[\s\S]*<\/head>/i.test(indexContent);
        if (!hasScriptInHead) {
            report.isValid = false;
            report.errors.push("ERRO: Nenhuma API ou Script de AdServer detectado no <head> do index.html.");
        }

        // --- 2. SCAN DE REQUISIÇÕES DE REDE (Integrado para não repetir busca) ---
        const externalRequestRegex = /(src|href)=["'](https?:\/\/.*?)["']/g;
        const matches = [...indexContent.matchAll(externalRequestRegex)];
        const uniqueRequests = [...new Set(matches.map(m => m[2]))];

        report.network = {
            count: uniqueRequests.length,
            urls: uniqueRequests,
            isOverLimit: uniqueRequests.length > 15
        };

        if (report.network.isOverLimit) {
            report.isValid = false;
            report.errors.push(`ERRO DE REDE: ${uniqueRequests.length} requisições externas detectadas (Limite IAB: 15).`);
        }
    }

    // --- 3. VALIDAÇÃO DINÂMICA DE ASSETS ---
    zipEntries.forEach(entry => {
        const fileName = entry.entryName.toLowerCase();

        // Filtro de extensões e proteção para não processar diretórios como arquivos
        if (!entry.isDirectory && /\.(jpg|jpeg|png|gif|mp4|webm|ogv)$/.test(fileName)) {
            const assetBuffer = entry.getData();
            const assetValidation = validateAssets(entry.entryName, assetBuffer);

            if (!assetValidation.isValid) {
                report.isValid = false;
                report.errors.push(...assetValidation.errors.map(err => `[${entry.entryName}]: ${err}`));
            }
        }
    });

    // --- 4. ALERTAS DE COMPLIANCE GLOBAL (IAB & UX) ---
    if (fileSizeKB > 150) {
        report.warnings.push("IAB: Peso inicial acima de 150KB. Certifique-se de que o restante do conteúdo seja carregado via Subload.");
    }

    report.warnings.push("REQUISITO UX: Verifique se a animação não excede 30s e se possui o limite de 3 loops.");
    report.warnings.push("TÉCNICO: Garanta que o z-index de elementos flutuantes seja inferior a 1.000.000 para evitar sobreposição de UI.");

    return report;
};

module.exports = { validateHTML5 };