const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { faker } = require('@faker-js/faker'); // BÍ MẬT NẰM Ở DÒNG NÀY

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
    res.json(mockData[resource] || []);
});

// 2. POST - Thêm dữ liệu
app.post('/api/:resource', (req, res) => {
    const resource = req.params.resource;
    if (!mockData[resource]) mockData[resource] = [];
    const newItem = { id: Date.now(), ...req.body };
    mockData[resource].push(newItem);
    res.status(201).json(newItem);
});

// 3. PUT - Sửa dữ liệu
app.put('/api/:resource/:id', (req, res) => {
    const { resource, id } = req.params;
    if (mockData[resource]) {
        const index = mockData[resource].findIndex(item => item.id == id);
        if (index !== -1) {
            mockData[resource][index] = { ...mockData[resource][index], ...req.body };
            return res.json(mockData[resource][index]);
        }
    }
    res.status(404).json({ error: "Item not found" });
});

// 4. DELETE - Xóa dữ liệu
app.delete('/api/:resource/:id', (req, res) => {
    const { resource, id } = req.params;
    if (mockData[resource]) {
        const initialLength = mockData[resource].length;
        mockData[resource] = mockData[resource].filter(item => item.id != id);
        if (mockData[resource].length < initialLength) {
            return res.status(200).json({ message: "Item deleted successfully" });
        }
    }
    res.status(404).json({ error: "Item not found" });
});

// 5. GENERATE - Tính năng VIP (Đẻ dữ liệu hàng loạt)
app.post('/api/generate/:resource/:count', (req, res) => {
    const { resource, count } = req.params;
    const numCount = parseInt(count) || 5; // Mặc định tạo 5 dòng nếu không nhập số

    if (!mockData[resource]) mockData[resource] = [];

    const newItems = [];
    for (let i = 0; i < numCount; i++) {
        const newItem = {
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
            avatar: faker.image.avatar()
        };
        mockData[resource].push(newItem);
        newItems.push(newItem);
    }

    res.status(201).json({
        message: `Successfully generated ${numCount} fake items for '${resource}'`,
        data: newItems
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API Mocker v2.0 is running on http://localhost:${PORT}`);
    console.log(`⭐ Auto-Generate Data Endpoint: POST http://localhost:${PORT}/api/generate/:resource/:count`);
});
