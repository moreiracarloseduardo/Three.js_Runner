const fs = require('fs');
const path = require('path');
const https = require('https');

console.log("🚀 Iniciando o Build do Playable Ad...");

function download(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return download(res.headers.location).then(resolve).catch(reject);
            }
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

async function build() {
    let html = fs.readFileSync('index.html', 'utf8');

    // Desliga o DEV_MODE
    html = html.replace(/const\s+DEV_MODE\s*=\s*true\s*;/g, 'const DEV_MODE = false;');
    console.log("⚙️  DEV_MODE alterado para false.");

    // ── PNG Sprites ──────────────────────────────────────────────────────────────
    const sprites = [
        'vpn.png', 'phishing.png',
        'floor.png', 'FloorNormalMap.png',
        'FloorTextureHeight.png', 'FloorTextureEdge.png', 'FloorTextureSmoothness.png',
        'Ceiling.png', 'CeilingNormalMap.png', 'CeilingTextureSmoothness.png',
        'Pillar.png', 'PillarNormalMap.png',
        'Sidewalk.png', 'SidewalkNormalMap.png',
        'card_people.png', 'player.png', 'virus.png'
    ];

    sprites.forEach(file => {
        const filePath = path.join(__dirname, 'assets', 'sprites', file);
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  AVISO: Arquivo não encontrado (pulando): ${file}`);
            return;
        }
        const dataURI = `data:image/png;base64,${fs.readFileSync(filePath, 'base64')}`;
        // Regex improved to handle any path prefix and match exact filename
        const flexibleRegex = new RegExp(`['"\`][^'"\`]*${file.replace('.', '\\.')}['"\`]`, 'g');

        if (flexibleRegex.test(html)) {
            html = html.replace(flexibleRegex, `"${dataURI}"`);
            console.log(`✅ Convertido: ${file}`);
        } else {
            console.log(`ℹ️  Não referenciado no HTML: ${file}`);
        }
    });

    // ── Audio ─────────────────────────────────────────────────────────────────────
    const audioFiles = ['Pixel_Prowler.ogg'];
    audioFiles.forEach(file => {
        const filePath = path.join(__dirname, 'assets', file);
        if (!fs.existsSync(filePath)) {
            console.log(`❌ ERRO: Áudio não encontrado: ${filePath}`);
            return;
        }
        const dataURI = `data:audio/ogg;base64,${fs.readFileSync(filePath, 'base64')}`;
        const audioRegex = new RegExp(`'assets/${file}'`, 'g');
        if (audioRegex.test(html)) {
            html = html.replace(new RegExp(`'assets/${file}'`, 'g'), `'${dataURI}'`);
            console.log(`✅ Convertido: ${file} (${Math.round(dataURI.length / 1024)}KB base64)`);
        } else {
            console.log(`⚠️  Não referenciado: ${file}`);
        }
    });

    // ── GLB Models ───────────────────────────────────────────────────────────────
    const glbModels = ['compressed.glb', 'virus.glb'];
    glbModels.forEach(modelFile => {
        const glbPath = path.join(__dirname, 'assets', '3dmodels', modelFile);
        if (!fs.existsSync(glbPath)) {
            console.log(`❌ ERRO: Modelo não encontrado: ${glbPath}`);
        } else {
            const glbDataURI = `data:model/gltf-binary;base64,${fs.readFileSync(glbPath, 'base64')}`;
            const glbRegex = new RegExp(`(['"\`])[\\.\\/a-zA-Z0-9_-]*${modelFile}\\1`, 'g');
            if (glbRegex.test(html)) {
                html = html.replace(glbRegex, `"${glbDataURI}"`);
                console.log(`✅ Convertido: ${modelFile} (${Math.round(glbDataURI.length / 1024)}KB base64)`);
            } else {
                console.log(`⚠️  ${modelFile} não encontrado no HTML`);
            }
        }
    });

    // ── Draco Decoder (inline para remover dependência CDN) ──────────────────────
    const dracoCache = path.join(__dirname, 'assets', 'draco');
    const wrapperPath = path.join(dracoCache, 'draco_wasm_wrapper.js');
    const wasmPath = path.join(dracoCache, 'draco_decoder.wasm');
    const dracoBase = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/';

    if (!fs.existsSync(dracoCache)) fs.mkdirSync(dracoCache, { recursive: true });

    if (!fs.existsSync(wrapperPath)) {
        console.log('⬇️  Baixando draco_wasm_wrapper.js...');
        fs.writeFileSync(wrapperPath, await download(dracoBase + 'draco_wasm_wrapper.js'));
        console.log('✅ draco_wasm_wrapper.js salvo em cache.');
    } else {
        console.log('📦 draco_wasm_wrapper.js (cache)');
    }

    if (!fs.existsSync(wasmPath)) {
        console.log('⬇️  Baixando draco_decoder.wasm...');
        fs.writeFileSync(wasmPath, await download(dracoBase + 'draco_decoder.wasm'));
        console.log('✅ draco_decoder.wasm salvo em cache.');
    } else {
        console.log('📦 draco_decoder.wasm (cache)');
    }

    const dracoWrapperB64 = fs.readFileSync(wrapperPath, 'base64');
    const dracoWasmB64 = fs.readFileSync(wasmPath, 'base64');

    const dracoPatch = `(function() {
            const _DW = '${dracoWrapperB64}';
            const _DM = '${dracoWasmB64}';
            function _b64ToText(b64) { return atob(b64); }
            function _b64ToBuffer(b64) {
                const bin = atob(b64), buf = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
                return buf.buffer;
            }
            const _orig = DRACOLoader.prototype._loadLibrary;
            DRACOLoader.prototype._loadLibrary = function(url, responseType) {
                if (url === 'draco_wasm_wrapper.js') return Promise.resolve(_b64ToText(_DW));
                if (url === 'draco_decoder.wasm')    return Promise.resolve(_b64ToBuffer(_DM));
                return _orig.call(this, url, responseType);
            };
        })();`;

    if (html.includes('// @@DRACO_PATCH@@')) {
        html = html.replace('// @@DRACO_PATCH@@', dracoPatch);
        console.log(`✅ Draco decoder injetado (${Math.round((dracoWrapperB64.length + dracoWasmB64.length) / 1024)}KB base64)`);
    } else {
        console.log(`⚠️  Placeholder @@DRACO_PATCH@@ não encontrado no HTML`);
    }

    fs.writeFileSync('final_playable_ad.html', html);
    console.log("🎉 Build concluído! Abra o 'final_playable_ad.html'.");
}

build().catch(err => {
    console.error('❌ Build falhou:', err);
    process.exit(1);
});
