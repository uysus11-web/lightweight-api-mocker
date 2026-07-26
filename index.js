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

// 1. GET - Lấy dữ liệu
app.get('/api/:resource', (req, res) => {
    const resource = req.params.resource;
    if (mockData[resource]) {
        res.json(mockData[resource]);
    } else {
        res.status(404).json({ error: "Resource not found" });
    }
});

// 2. POST - Thêm dữ liệu
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

// 3. PUT - Sửa dữ liệu
app.put('/api/:resource/:id', (req, res) => {
    const { resource, id } = req.params;
    if (mockData[resource]) {
        const index = mockData[resource].findIndex(item => item.id == id);
        if (index !== -1) {
            mockData[resource][index] = { ...mockData[resource][index], ...req.body };
            res.json(mockData[resource][index]);
        } else {
            res.status(404).json({ error: "Item not found" });
        }
    } else {
        res.status(404).json({ error: "Resource not found" });
    }
});

// 4. DELETE - Xóa dữ liệu
app.delete('/api/:resource/:id', (req, res) => {
    const { resource, id } = req.params;
    if (mockData[resource]) {
        const initialLength = mockData[resource].length;
        mockData[resource] = mockData[resource].filter(item => item.id != id);
        if (mockData[resource].length < initialLength) {
            res.status(200).json({ message: "Item deleted successfully" });
        } else {
            res.status(404).json({ error: "Item not found" });
        }
    } else {
        res.status(404).json({ error: "Resource not found" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 API Mocker v1.9.4 is running on http://localhost:${PORT}`);
    console.log(`Available endpoints:`);
    Object.keys(mockData).forEach(key => {
        console.log(`- GET/POST: http://localhost:${PORT}/api/${key}`);
        console.log(`- PUT/DELETE: http://localhost:${PORT}/api/${key}/:id`);
    });
});
