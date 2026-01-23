/**
 * API Route Vercel pour sauvegarder les inscriptions
 * Utilise l'API GitHub pour écrire dans le fichier inscriptions.js
 */

export default async function handler(req, res) {
    // CORS headers pour permettre les requêtes depuis le frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        return handleGet(req, res);
    }

    if (req.method === 'POST') {
        return handlePost(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * Récupère les inscriptions depuis GitHub
 */
async function handleGet(req, res) {
    try {
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const GITHUB_OWNER = process.env.GITHUB_OWNER || 'natacha-aviat';
        const GITHUB_REPO = process.env.GITHUB_REPO || 'natacha-aviat.github.io';
        const FILE_PATH = 'projets/outils/MaMaCollecte/inscriptions.js';

        if (!GITHUB_TOKEN) {
            return res.status(500).json({ error: 'GITHUB_TOKEN non configuré' });
        }

        // Récupérer le contenu du fichier depuis GitHub
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                // Fichier n'existe pas encore, retourner un tableau vide
                return res.status(200).json([]);
            }
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();
        const content = Buffer.from(data.content, 'base64').toString('utf-8');

        // Extraire le tableau INSCRIPTIONS du fichier JS
        const match = content.match(/const INSCRIPTIONS = (\[[\s\S]*?\]);/);
        if (match) {
            try {
                // Évaluer le contenu JavaScript de manière sécurisée
                const inscriptions = eval(match[1]);
                return res.status(200).json(inscriptions);
            } catch (e) {
                console.error('Erreur lors du parsing:', e);
                return res.status(200).json([]);
            }
        }

        return res.status(200).json([]);
    } catch (error) {
        console.error('Erreur GET:', error);
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Sauvegarde les inscriptions dans GitHub
 */
async function handlePost(req, res) {
    try {
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const GITHUB_OWNER = process.env.GITHUB_OWNER || 'natacha-aviat';
        const GITHUB_REPO = process.env.GITHUB_REPO || 'natacha-aviat.github.io';
        const FILE_PATH = 'projets/outils/MaMaCollecte/inscriptions.js';

        if (!GITHUB_TOKEN) {
            return res.status(500).json({ error: 'GITHUB_TOKEN non configuré' });
        }

        const { inscriptions } = req.body;

        if (!Array.isArray(inscriptions)) {
            return res.status(400).json({ error: 'Le champ "inscriptions" doit être un tableau' });
        }

        // Générer le contenu du fichier JS
        const jsContent = generateInscriptionsJS(inscriptions);

        // Récupérer le SHA du fichier existant (nécessaire pour la mise à jour)
        let sha = null;
        try {
            const getResponse = await fetch(
                `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
                {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                    },
                }
            );

            if (getResponse.ok) {
                const data = await getResponse.json();
                sha = data.sha;
            }
        } catch (e) {
            // Fichier n'existe pas encore, on va le créer
            console.log('Fichier n\'existe pas encore, création...');
        }

        // Encoder le contenu en base64
        const content = Buffer.from(jsContent, 'utf-8').toString('base64');

        // Créer ou mettre à jour le fichier
        const updateResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Mise à jour des inscriptions (${inscriptions.length} inscription(s))`,
                    content: content,
                    sha: sha, // null si nouveau fichier
                }),
            }
        );

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(`GitHub API error: ${updateResponse.status} - ${JSON.stringify(errorData)}`);
        }

        return res.status(200).json({
            success: true,
            message: `${inscriptions.length} inscription(s) sauvegardée(s)`,
            count: inscriptions.length,
        });
    } catch (error) {
        console.error('Erreur POST:', error);
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Génère le contenu du fichier inscriptions.js
 */
function generateInscriptionsJS(inscriptions) {
    let jsContent = '// Inscriptions pour MaMaCollecte\n';
    jsContent += '// Généré le ' + new Date().toLocaleString('fr-FR') + '\n';
    jsContent += 'const INSCRIPTIONS = [\n';

    const escapeString = (str) => {
        if (str === null || str === undefined) return '""';
        const s = String(str);
        return '"' + s
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/'/g, "\\'")
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')
            + '"';
    };

    inscriptions.forEach((reg, index) => {
        jsContent += '    {\n';
        jsContent += `        id: ${escapeString(reg.id)},\n`;
        jsContent += `        firstName: ${escapeString(reg.firstName || '')},\n`;
        jsContent += `        lastName: ${escapeString(reg.lastName || '')},\n`;
        jsContent += `        phone: ${escapeString(reg.phone)},\n`;
        jsContent += `        email: ${escapeString(reg.email)},\n`;
        jsContent += `        dateKey: ${escapeString(reg.dateKey)},\n`;
        jsContent += `        dateStr: ${escapeString(reg.dateStr || '')},\n`;
        jsContent += `        slotId: ${escapeString(reg.slotId)},\n`;
        jsContent += `        slotTime: ${escapeString(reg.slotTime)},\n`;
        jsContent += `        location: ${escapeString(reg.location)},\n`;
        jsContent += `        locationName: ${escapeString(reg.locationName || '')},\n`;
        jsContent += `        slotKey: ${escapeString(reg.slotKey)},\n`;
        jsContent += `        timestamp: ${escapeString(reg.timestamp)}\n`;
        jsContent += '    }';
        if (index < inscriptions.length - 1) {
            jsContent += ',';
        }
        jsContent += '\n';
    });

    jsContent += '];\n';
    return jsContent;
}
