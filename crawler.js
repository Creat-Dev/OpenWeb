const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const url = require('url');

class Crawler {
    constructor(maxDepth = 3) {
        this.data = [];
        this.visitedUrls = new Set();
        this.maxDepth = maxDepth;
    }

    isValidUrl(urlString) {
        try {
            new URL(urlString);
            return true;
        } catch {
            return false;
        }
    }

    normalizeUrl(baseUrl, href) {
        try {
            const absoluteUrl = new URL(href, baseUrl);
            return absoluteUrl.href;
        } catch {
            return null;
        }
    }

    extractCategories($) {
        const categories = [];
        const metaKeywords = $('meta[name="keywords"]').attr('content');
        if (metaKeywords) {
            categories.push(...metaKeywords.split(',').map(k => k.trim()).filter(Boolean));
        }
        const ogType = $('meta[property="og:type"]').attr('content');
        if (ogType && !categories.includes(ogType)) {
            categories.push(ogType);
        }
        $('a, nav, .category, .breadcrumb').each((_, el) => {
            const text = $(el).text().trim();
            if (
                text.length > 1 &&
                text.length < 32 &&
                /^[A-Za-zÀ-ÿ0-9\s\-]+$/.test(text) &&
                !categories.includes(text)
            ) {
                categories.push(text);
            }
        });
        return [...new Set(categories)].slice(0, 5);
    }

    extractImages($, baseUrl) {
        const images = [];
        const ogImage = $('meta[property="og:image"]').attr('content');
        if (ogImage) images.push(this.normalizeUrl(baseUrl, ogImage));
        $('img').each((_, el) => {
            if (images.length >= 3) return false;
            const src = $(el).attr('src');
            if (src) {
                const abs = this.normalizeUrl(baseUrl, src);
                if (abs && !images.includes(abs)) images.push(abs);
            }
        });
        return images;
    }

    async crawlPage(baseUrl, depth = 0) {
        if (depth >= this.maxDepth || this.visitedUrls.has(baseUrl)) {
            return;
        }

        this.visitedUrls.add(baseUrl);
        console.log(`Crawling: ${baseUrl} (Depth: ${depth})`);

        try {
            const response = await axios.get(baseUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 CustomCrawler/1.0' },
                timeout: 5000
            });

            const $ = cheerio.load(response.data);

            const images = this.extractImages($, baseUrl);
            const categories = this.extractCategories($);

            const pageData = {
                url: baseUrl,
                title: $('title').text() || baseUrl,
                description: $('meta[name="description"]').attr('content') ||
                    $('p').first().text().substring(0, 160) || '',
                image: images[0] || '',
                images,
                favicon: $('link[rel="icon"]').attr('href') ||
                    $('link[rel="shortcut icon"]').attr('href') || '/favicon.ico',
                content: $('body').text().substring(0, 500).trim(),
                categories,
                links: []
            };

            this.data.push(pageData);
            this.saveData();

            const links = new Set();
            $('a').each((_, element) => {
                const href = $(element).attr('href');
                if (href) {
                    const absoluteUrl = this.normalizeUrl(baseUrl, href);
                    if (absoluteUrl && this.isValidUrl(absoluteUrl)) {
                        links.add(absoluteUrl);
                    }
                }
            });

            for (const link of links) {
                await this.crawlPage(link, depth + 1);
            }
        } catch (error) {
            console.error(`Error crawling ${baseUrl}:`, error.message);
        }
    }

    saveData() {
        fs.writeFileSync('searchData.json', JSON.stringify(this.data, null, 2));
    }
}

module.exports = Crawler;
