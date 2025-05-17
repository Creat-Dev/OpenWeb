const express = require('express');
const path = require('path');
const fs = require('fs');
const Crawler = require('./crawler');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(__dirname));

app.use(express.json());

app.get('/search', (req, res) => {
    const query = req.query.q.toLowerCase();
    try {
        const searchData = JSON.parse(fs.readFileSync('searchData.json', 'utf8'));
        const results = searchData.filter(page => 
            page.title.toLowerCase().includes(query) ||
            page.description.toLowerCase().includes(query) ||
            page.content.toLowerCase().includes(query)
        );
        res.json(results);
    } catch (error) {
        console.error('Error reading search data:', error);
        res.json([]);
    }
});

app.get('/api/search', (req, res) => {
    const q = (req.query.q || '').toLowerCase();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 50;

    let data = [];
    try {
        data = JSON.parse(fs.readFileSync(path.join(__dirname, 'searchData.json'), 'utf8'));
    } catch (e) {
        return res.status(500).json({ error: 'searchData.json not found' });
    }

    let results = data;
    if (q) {
        results = data.filter(item =>
            (item.title && item.title.toLowerCase().includes(q)) ||
            (item.description && item.description.toLowerCase().includes(q)) ||
            (item.content && item.content.toLowerCase().includes(q))
        );
    }

    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = results.slice(start, start + limit);

    res.json({
        results: paginated,
        total,
        page,
        limit,
        totalPages
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
