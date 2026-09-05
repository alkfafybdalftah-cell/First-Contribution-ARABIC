const { addonBuilder } = require('stremio-addon-sdk');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

// إعدادات الإضافة
const builder = new addonBuilder({
    id: 'com.wecima.addon',
    name: 'WeCima Addon',
    version: '1.0.0',
    description: 'Custom addon to fetch movies and series from WeCima',
    resources: ['catalog', 'stream'],
    types: ['movie', 'series'],
    idPrefixes: ['tt']
});

// 1. معالج الكتالوج (البحث وعرض المحتوى)
builder.defineCatalogHandler(async function(args) {
    try {
        const url = 'https://wecima.cx/';
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        const metas = [];

        // استخراج الأفلام والمسلسلات من الصفحة الرئيسية أو البحث
        $('.GridBody .GridItem').each((i, el) => {
            const title = $(el).find('.inner strong, .title').text().trim();
            const link = $(el).find('a').attr('href');
            const poster = $(el).find('.poster img').attr('data-src') || $(el).find('.poster img').attr('src');
            
            if (link && title) {
                metas.push({
                    id: 'wecima_' + Buffer.from(link).toString('base64').substring(0, 10),
                    type: args.type,
                    name: title,
                    poster: poster,
                    description: 'WeCima Stream'
                });
            }
        });

        return { metas };
    } catch (e) {
        return { metas: [] };
    }
});

// 2. معالج الروابط (جلب رابط المشاهدة المباشر)
builder.defineStreamHandler(async function(args) {
    try {
        // هنا يتم معالجة جلب روابط السيرفرات الحقيقية من صفحة العمل
        const streams = [
            {
                title: 'WeCima - Server 1 (1080p)',
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' // رابط تجريبي للتأكد من التشغيل
            }
        ];
        return { streams };
    } catch (e) {
        return { streams: [] };
    }
});

module.exports = builder.getInterface();
