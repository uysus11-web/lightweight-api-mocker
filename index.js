const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load mock data safely
let mockData = {};
try {
    const rawData = fs.readFileSync('./db.json', 'utf-8');
    mockData = JSON.parse(rawData);
} catch (error) {
    console.error("Error loading db.json. Make sure the file exists.");
}

// GET request - Lấy dữ liệu
app.get('/api/:resource', (req, res) => {
    const resource = req.params.resource;
    if (mockData[resource]) {
        res.json(mockData[resource]);
    } else {
        res.status(404).json({ error: "Resource not found" });
    }
});

// POST request - Thêm dữ liệu giả
app.post('/api/:resource', (req, res) => {
    const resource = req.params.resource;
    if (mockData[resource]) {
        const newItem = { id: Date.now(), ...req.body };
        mockData[resource].push(newItem);
        res.status(201).json(newItem);
    } else {
        res.status(404).json({ error: "Resource not found" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 API Mocker is running on http://localhost:${PORT}`);
    console.log(`Available endpoints:`);
    Object.keys(mockData).forEach(key => {
        console.log(`- GET/POST: http://localhost:${PORT}/api/${key}`);
    });
});
