const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const PORT = process.env.PORT || 4000;
const DEFAULT_ADMIN_KEY = process.env.ADMIN_KEY || 'sushi-home-2026';

function ensureDataFile() {
    fs.mkdirSync(DATA_DIR, { recursive: true });

    if (!fs.existsSync(ORDERS_FILE)) {
        fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');
    }

    if (!fs.existsSync(CONFIG_FILE)) {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify({
            admin: {
                accessKey: DEFAULT_ADMIN_KEY
            },
            index: {
                banners: [
                    {
                        title: 'Свіжі суші та роли щодня',
                        subtitle: 'Найкращий смак, швидка доставка й атмосфера дому.',
                        image: 'images/slider-1.jpg'
                    }
                ],
                newProducts: [
                    {
                        title: 'Новинка дня',
                        price: '250 грн',
                        weight: '210 г',
                        ingredients: 'Лосось, рис, авокадо',
                        image: 'images/New/HotCrub.jpg'
                    }
                ]
            },
            menu: {
                categories: [
                    { id: 'sushi', name: 'СУШІ' },
                    { id: 'maki', name: 'МАКІ' }
                ],
                items: [
                    {
                        id: 'sample-1',
                        category: 'sushi',
                        title: 'Класичний сет',
                        price: '420 грн',
                        weight: '440 г',
                        ingredients: 'Лосось, креветка, авокадо',
                        image: 'images/Filadelfiya/filadelfiya-1.jpg'
                    }
                ]
            },
            delivery: {
                text: 'Доставка по району, швидко, свіжо й зручно — замовляйте в будь-який час дня.'
            }
        }, null, 2), 'utf8');
    }
}

// The original catalogue lives in menu.js and the home-page novelties in
// index.html.  Older installations already have config.json, but it is empty,
// so initialise it from those source files exactly once.  After this import
// the admin panel is the source of truth and an intentionally empty catalogue
// will not be filled again.
function extractArray(source, variableName) {
    const marker = `const ${variableName} = [`;
    const start = source.indexOf(marker);
    if (start < 0) return [];

    const arrayStart = source.indexOf('[', start);
    let depth = 0;
    let quote = null;
    let escaped = false;

    for (let index = arrayStart; index < source.length; index += 1) {
        const char = source[index];
        if (quote) {
            if (escaped) escaped = false;
            else if (char === '\\') escaped = true;
            else if (char === quote) quote = null;
            continue;
        }
        if (char === '"' || char === "'" || char === '`') {
            quote = char;
        } else if (char === '[') {
            depth += 1;
        } else if (char === ']') {
            depth -= 1;
            if (depth === 0) {
                try {
                    const value = vm.runInNewContext(`(${source.slice(arrayStart, index + 1)})`);
                    return Array.isArray(value) ? value : [];
                } catch (error) {
                    return [];
                }
            }
        }
    }
    return [];
}

function importLegacyCatalogue(config) {
    if (config?.meta?.catalogImported) return config;
    const isEmpty = !config?.index?.banners?.length
        && !config?.index?.newProducts?.length
        && !config?.menu?.categories?.length
        && !config?.menu?.items?.length;
    if (!isEmpty) return config;

    try {
        const menuHtml = fs.readFileSync(path.join(ROOT, 'menu.html'), 'utf8');
        const menuScript = fs.readFileSync(path.join(ROOT, 'js', 'menu.js'), 'utf8');
        const homeHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
        const categories = [...menuHtml.matchAll(/<button[^>]*data-category="([^"]+)"[^>]*>([^<]+)<\/button>/g)]
            .map(([, id, name]) => ({ id, name: name.trim() }));
        const sources = [
            ['setData', 'sety'], ['filadelfiyaData', 'filadelfiya'], ['firmoviData', 'firmovi'],
            ['kaliforniyaData', 'kaliforniya'], ['drakonyData', 'drakony'], ['bonitoData', 'bonito'],
            ['zKrevetkamiData', 'z-krevetkami'], ['zMidiyamiData', 'z-midiyami'], ['zapeczeniData', 'zapeczeni'],
            ['tempuraData', 'tempura'], ['futomakiData', 'futomaki'], ['inyanData', 'inyan'],
            ['makiData', 'maki'], ['sushiData', 'sushi'], ['solodkiRolyData', 'solodki-roly'],
            ['frityurData', 'frityur'], ['supyData', 'supy'], ['salatyData', 'salaty']
        ];
        const items = sources.flatMap(([variableName, category]) => extractArray(menuScript, variableName)
            .map(([title, price, weight, ingredients, image], index) => ({
                id: `${category}-${index + 1}`,
                category,
                title,
                price,
                weight,
                ingredients,
                image: image || ''
            })));
        const napoiGroups = extractArray(menuScript, 'napoiGroups');
        napoiGroups.forEach((group, groupIndex) => {
            (group.items || []).forEach(([title, price, weight, ingredients, image], itemIndex) => {
                items.push({
                    id: `napoi-${groupIndex + 1}-${itemIndex + 1}`,
                    category: 'napoi', title, price, weight, ingredients, image: image || ''
                });
            });
        });
        const newProducts = [...homeHtml.matchAll(/<article class="product-card"\s+data-weight="([^"]*)"\s+data-ingredients="([^"]*)">[\s\S]*?<img src="([^"]*)"[^>]*>[\s\S]*?<h3>([\s\S]*?)<\/h3>[\s\S]*?<span>ЦІНА:\s*([^<]+)<\/span>[\s\S]*?<\/article>/g)]
            .map(([, weight, ingredients, image, title, price], index) => ({
                id: `new-${index + 1}`,
                title: title.trim(), price: price.trim(), weight: weight.trim(), ingredients: ingredients.trim(), image
            }));
        const banners = [...homeHtml.matchAll(/<img class="slider-slide[^"\n]*" src="([^"]+)"/g)]
            .map(([ , image], index) => ({ title: `Банер ${index + 1}`, subtitle: '', image }));

        if (!categories.length && !items.length && !newProducts.length && !banners.length) return config;
        return {
            ...config,
            meta: { ...(config.meta || {}), catalogImported: true },
            index: { ...(config.index || {}), banners, newProducts },
            menu: { ...(config.menu || {}), categories, items }
        };
    } catch (error) {
        return config;
    }
}

function importLegacyDeliveryRates(config) {
    if (config?.meta?.deliveryRatesImported) return config;
    if (Array.isArray(config?.delivery?.rates) && config.delivery.rates.length) return config;

    try {
        const deliveryHtml = fs.readFileSync(path.join(ROOT, 'delivery.html'), 'utf8');
        const rates = [...deliveryHtml.matchAll(/<tr><td>([\s\S]*?)<\/td><td>([\s\S]*?)<\/td><\/tr>/g)]
            .map(([, location, conditions]) => ({
                location: location.replace(/<[^>]+>/g, '').trim(),
                conditions: conditions.replace(/<[^>]+>/g, '').trim()
            }))
            .filter((rate) => rate.location && rate.conditions);
        if (!rates.length) return config;
        return {
            ...config,
            meta: { ...(config.meta || {}), deliveryRatesImported: true },
            delivery: { ...(config.delivery || {}), rates }
        };
    } catch (error) {
        return config;
    }
}

function readOrders() {
    ensureDataFile();

    try {
        const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');
        return [];
    }
}

function readConfig() {
    ensureDataFile();

    try {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return {};
        const importedCatalogue = importLegacyCatalogue(parsed);
        const imported = importLegacyDeliveryRates(importedCatalogue);
        if (imported !== parsed) writeConfig(imported);
        return imported;
    } catch (error) {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify({
            admin: { accessKey: DEFAULT_ADMIN_KEY },
            index: { banners: [], newProducts: [] },
            menu: { categories: [], items: [] },
            delivery: { text: '' }
        }, null, 2), 'utf8');
        return { admin: { accessKey: DEFAULT_ADMIN_KEY }, index: { banners: [], newProducts: [] }, menu: { categories: [], items: [] }, delivery: { text: '' } };
    }
}

function writeOrders(orders) {
    ensureDataFile();
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
}

function writeConfig(config) {
    ensureDataFile();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

function sanitizeUploadName(fileName) {
    const baseName = (fileName || 'upload').split(/[\\/]/).pop() || 'upload';
    const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return safeName || 'upload';
}

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(payload));
}

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.map': 'application/json; charset=utf-8'
    };

    return mimeTypes[ext] || 'application/octet-stream';
}

function serveFile(res, filePath) {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
    }

    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
        'Content-Type': getMimeType(filePath),
        ...(path.extname(filePath).toLowerCase() === '.html'
            ? { 'Cache-Control': 'no-store, max-age=0' }
            : {})
    });
    res.end(content);
}

const server = http.createServer((req, res) => {
    const requestUrl = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(requestUrl.pathname);

    const acceptOrderMatch = pathname.match(/^\/api\/orders\/([^/]+)\/accept$/);
    if (acceptOrderMatch) {
        if (req.method === 'OPTIONS') {
            sendJson(res, 200, { ok: true });
            return;
        }

        if (req.method === 'POST') {
            const orderId = acceptOrderMatch[1];
            const orders = readOrders();
            const order = orders.find((item) => String(item.id) === orderId);

            if (!order) {
                sendJson(res, 404, { message: 'Замовлення не знайдено.' });
                return;
            }

            order.status = 'accepted';
            order.acceptedAt = new Date().toISOString();
            writeOrders(orders);
            sendJson(res, 200, { message: 'Замовлення прийнято.', order });
            return;
        }

        sendJson(res, 405, { message: 'Метод не підтримується.' });
        return;
    }

    if (pathname === '/api/orders') {
        if (req.method === 'OPTIONS') {
            sendJson(res, 200, { ok: true });
            return;
        }

        if (req.method === 'GET') {
            sendJson(res, 200, { orders: readOrders() });
            return;
        }

        if (req.method === 'POST') {
            let body = '';

            req.on('data', (chunk) => {
                body += chunk;
            });

            req.on('end', () => {
                try {
                    const payload = body ? JSON.parse(body) : {};

                    if (!payload || typeof payload !== 'object') {
                        throw new Error('Некоректні дані замовлення');
                    }

                    const name = String(payload.name || '').trim() || 'Клієнт';
                    const phone = String(payload.phone || '').trim() || 'Номер не вказаний';
                    const address = String(payload.address || '').trim() || 'Адреса не вказана';
                    const comment = String(payload.comment || '').trim();
                    const items = Array.isArray(payload.items) ? payload.items : [];
                    const total = Number(payload.total || 0);

                    if (!items.length) {
                        throw new Error('Додайте хоча б один товар до кошика');
                    }

                    const orders = readOrders();
                    const newOrder = {
                        id: payload.id || Date.now(),
                        createdAt: payload.createdAt || new Date().toISOString(),
                        name,
                        phone,
                        address,
                        comment,
                        items,
                        total
                    };

                    orders.unshift(newOrder);
                    writeOrders(orders);

                    sendJson(res, 200, {
                        message: 'Замовлення успішно надіслано.',
                        order: newOrder
                    });
                } catch (error) {
                    sendJson(res, 400, {
                        message: error.message || 'Не вдалося зберегти замовлення.'
                    });
                }
            });

            return;
        }
    }

    if (pathname === '/api/upload') {
        if (req.method === 'OPTIONS') {
            sendJson(res, 200, { ok: true });
            return;
        }

        if (req.method === 'POST') {
            let body = '';

            req.on('data', (chunk) => {
                body += chunk;
            });

            req.on('end', () => {
                try {
                    const payload = body ? JSON.parse(body) : {};
                    const dataUrl = String(payload.dataUrl || '').trim();
                    const fileName = sanitizeUploadName(payload.fileName || 'upload');

                    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
                        throw new Error('Невірний формат фото');
                    }

                    const match = dataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
                    if (!match) {
                        throw new Error('Не вдалося розпізнати фото');
                    }

                    const uploadsDir = path.join(ROOT, 'uploads');
                    fs.mkdirSync(uploadsDir, { recursive: true });

                    const extension = path.extname(fileName) || '.png';
                    const baseName = path.basename(fileName, extension).replace(/[^a-zA-Z0-9_-]/g, '_') || 'upload';
                    const uniqueName = `${baseName}-${Date.now()}${extension}`;
                    const fullPath = path.join(uploadsDir, uniqueName);
                    fs.writeFileSync(fullPath, Buffer.from(match[1], 'base64'));

                    sendJson(res, 200, {
                        message: 'Фото завантажено',
                        path: `/uploads/${uniqueName}`
                    });
                } catch (error) {
                    sendJson(res, 400, {
                        message: error.message || 'Не вдалося зберегти фото'
                    });
                }
            });

            return;
        }
    }

    if (pathname === '/api/admin/login') {
        if (req.method === 'OPTIONS') {
            sendJson(res, 200, { ok: true });
            return;
        }

        if (req.method === 'POST') {
            let body = '';

            req.on('data', (chunk) => {
                body += chunk;
            });

            req.on('end', () => {
                try {
                    const payload = body ? JSON.parse(body) : {};
                    const enteredKey = String(payload.key || '').trim();
                    const storedKey = String(readConfig().admin?.accessKey || DEFAULT_ADMIN_KEY).trim();

                    if (!enteredKey || enteredKey !== storedKey) {
                        sendJson(res, 401, { message: 'Невірний ключ доступу.' });
                        return;
                    }

                    sendJson(res, 200, { message: 'Доступ дозволено.' });
                } catch (error) {
                    sendJson(res, 400, { message: 'Не вдалося перевірити ключ.' });
                }
            });

            return;
        }
    }

    if (pathname === '/api/config') {
        if (req.method === 'OPTIONS') {
            sendJson(res, 200, { ok: true });
            return;
        }

        if (req.method === 'GET') {
            sendJson(res, 200, { config: readConfig() });
            return;
        }

        if (req.method === 'POST') {
            let body = '';

            req.on('data', (chunk) => {
                body += chunk;
            });

            req.on('end', () => {
                try {
                    const payload = body ? JSON.parse(body) : {};
                    const safeConfig = payload && typeof payload === 'object' ? payload : {};
                    const existing = readConfig();
                    const adminKey = existing.admin?.accessKey || DEFAULT_ADMIN_KEY;
                    writeConfig({
                        ...safeConfig,
                        meta: safeConfig.meta || existing.meta || {},
                        admin: {
                            ...(safeConfig.admin || {}),
                            accessKey: adminKey
                        }
                    });
                    sendJson(res, 200, {
                        message: 'Налаштування успішно збережено.',
                        config: readConfig()
                    });
                } catch (error) {
                    sendJson(res, 400, { message: 'Не вдалося зберегти налаштування.' });
                }
            });

            return;
        }
    }

    if (pathname === '/admin.html' || pathname === '/admin') {
        serveFile(res, path.join(ROOT, 'admin.html'));
        return;
    }

    if (pathname.startsWith('/uploads/')) {
        const relativePath = pathname.replace(/^\/uploads\//, '');
        const uploadRoot = path.join(ROOT, 'uploads');
        const safePath = path.normalize(path.join(uploadRoot, relativePath));

        if (!safePath.startsWith(uploadRoot)) {
            res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Forbidden');
            return;
        }

        serveFile(res, safePath);
        return;
    }

    let safePath = pathname === '/' ? path.join(ROOT, 'index.html') : path.join(ROOT, pathname);
    safePath = path.normalize(safePath);

    if (!safePath.startsWith(ROOT)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Forbidden');
        return;
    }

    serveFile(res, safePath);
});

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Sushi Home server running on http://localhost:${PORT}`);
        console.log(`Orders admin: http://localhost:${PORT}/admin.html`);
    });
}

module.exports = { readConfig, importLegacyCatalogue };
